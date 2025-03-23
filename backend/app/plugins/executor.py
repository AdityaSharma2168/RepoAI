import importlib.util
import os
import sys
import tempfile
import shutil
import subprocess
from typing import Dict, Any, Optional
import docker
import json
import logging

from ..config import settings

class PluginExecutor:
    """Manages plugin execution in a secure environment."""
    
    def __init__(self):
        self.plugin_dir = settings.PLUGIN_DIR
        os.makedirs(self.plugin_dir, exist_ok=True)
    
    def execute_local(self, plugin_path: str, method_name: str, params: Dict[str, Any]) -> Any:
        """
        Execute a plugin locally (unsafe, only for trusted plugins).
        
        Args:
            plugin_path: Path to the plugin file
            method_name: Name of the method to call
            params: Parameters to pass to the method
            
        Returns:
            Result of the method call
        """
        try:
            # Import the plugin module dynamically
            spec = importlib.util.spec_from_file_location("plugin_module", plugin_path)
            if spec is None or spec.loader is None:
                raise ImportError(f"Could not load plugin from {plugin_path}")
                
            plugin_module = importlib.util.module_from_spec(spec)
            sys.modules["plugin_module"] = plugin_module
            spec.loader.exec_module(plugin_module)
            
            # Get the run method
            plugin_class = getattr(plugin_module, "Plugin")
            plugin_instance = plugin_class()
            method = getattr(plugin_instance, method_name)
            
            # Execute the method
            return method(**params)
            
        except Exception as e:
            logging.error(f"Error executing plugin {plugin_path}: {str(e)}")
            raise
    
    def execute_docker(self, plugin_path: str, method_name: str, params: Dict[str, Any]) -> Any:
        """
        Execute a plugin in a Docker container (safe for untrusted plugins).
        
        Args:
            plugin_path: Path to the plugin file
            method_name: Name of the method to call
            params: Parameters to pass to the method
            
        Returns:
            Result of the method call
        """
        try:
            # Create a temporary directory for the plugin
            with tempfile.TemporaryDirectory() as temp_dir:
                # Copy the plugin file to the temp directory
                plugin_filename = os.path.basename(plugin_path)
                temp_plugin_path = os.path.join(temp_dir, plugin_filename)
                shutil.copy(plugin_path, temp_plugin_path)
                
                # Create a wrapper script to run the plugin
                wrapper_path = os.path.join(temp_dir, "run_plugin.py")
                with open(wrapper_path, "w") as f:
                    f.write(f"""
import json
import sys
from {os.path.splitext(plugin_filename)[0]} import Plugin

def main():
    try:
        # Load parameters from stdin
        params = json.loads(sys.stdin.read())
        
        # Initialize the plugin
        plugin = Plugin()
        
        # Call the specified method
        result = getattr(plugin, "{method_name}")(**params)
        
        # Return the result as JSON
        print(json.dumps({{"status": "success", "result": result}}))
        
    except Exception as e:
        print(json.dumps({{"status": "error", "error": str(e)}}))

if __name__ == "__main__":
    main()
                    """)
                
                # Create a client to interact with Docker
                client = docker.from_env()
                
                # Run the plugin in a container
                container = client.containers.run(
                    image="python:3.9-slim",  # Base Python image
                    command=f"python /app/run_plugin.py",
                    volumes={temp_dir: {"bind": "/app", "mode": "ro"}},
                    stdin_open=True,
                    detach=True,
                    mem_limit="256m",  # Limit memory usage
                    network_mode="none",  # Disable network access
                    auto_remove=True
                )
                
                # Pass the parameters to the container
                container.attach(
                    stdin=True, 
                    stdout=False, 
                    stderr=False, 
                    stream=False
                ).write(json.dumps(params).encode())
                
                # Get the output from the container
                result = container.wait()
                logs = container.logs().decode()
                
                # Check if the execution was successful
                if result["StatusCode"] != 0:
                    raise Exception(f"Plugin execution failed: {logs}")
                
                # Parse the output
                try:
                    output = json.loads(logs)
                    if output["status"] == "error":
                        raise Exception(output["error"])
                    return output["result"]
                except json.JSONDecodeError:
                    raise Exception(f"Invalid output from plugin: {logs}")
                
        except Exception as e:
            logging.error(f"Error executing plugin {plugin_path} in Docker: {str(e)}")
            raise
    
    def execute(self, plugin_path: str, method_name: str, params: Dict[str, Any], secure: bool = True) -> Any:
        """
        Execute a plugin either locally or in a Docker container.
        
        Args:
            plugin_path: Path to the plugin file
            method_name: Name of the method to call
            params: Parameters to pass to the method
            secure: Whether to use Docker for secure execution
            
        Returns:
            Result of the method call
        """
        if secure:
            return self.execute_docker(plugin_path, method_name, params)
        else:
            return self.execute_local(plugin_path, method_name, params)

# Create singleton instance
plugin_executor = PluginExecutor() 