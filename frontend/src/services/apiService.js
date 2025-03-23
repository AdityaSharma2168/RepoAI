import { mockTools, mockPlugins, mockToolExecutions, mockAuth } from './mockData';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const USE_MOCK = true; // Set to false to use real API

class ApiService {
  constructor() {
    this.retryCount = 0;
    this.maxRetries = 3;
    this.retryDelay = 1000; // ms
  }

  // Auth endpoints
  async login(username, password) {
    if (USE_MOCK) {
      try {
        return await mockAuth.login(username, password);
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }
      
      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      return data;
    } catch (error) {
      console.error('Login API error:', error);
      throw error;
    }
  }
  
  async logout() {
    if (USE_MOCK) {
      return mockAuth.logout();
    }
    
    localStorage.removeItem('token');
    return true;
  }
  
  async getCurrentUser() {
    if (USE_MOCK) {
      try {
        return mockAuth.getUser();
      } catch (error) {
        // If not authenticated, clear token and redirect
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw error;
      }
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/users/me`);
      return await response.json();
    } catch (error) {
      console.error('Error getting current user:', error);
      throw error;
    }
  }
  
  // Tools endpoints
  async getTools() {
    if (USE_MOCK) {
      return mockTools;
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/tools`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching tools:', error);
      throw error;
    }
  }
  
  async getTool(id) {
    if (USE_MOCK) {
      const tool = mockTools.find(t => t.id === id);
      if (!tool) throw new Error('Tool not found');
      return tool;
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/tools/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching tool ${id}:`, error);
      throw error;
    }
  }
  
  async executeTool(toolName, params, retryAttempt = 0) {
    if (USE_MOCK) {
      if (!mockToolExecutions[toolName]) {
        return { 
          error: `Tool "${toolName}" not found or not supported`, 
          status: 'error',
          code: 'TOOL_NOT_FOUND'
        };
      }
      
      try {
        const result = mockToolExecutions[toolName](params);
        
        // If service unavailable, retry a few times
        if (result.status === 'error' && result.code === 'SERVICE_UNAVAILABLE' && retryAttempt < this.maxRetries) {
          console.log(`Tool execution failed, retrying (${retryAttempt + 1}/${this.maxRetries})...`);
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          
          // Recursive retry with incremented attempt count
          return this.executeTool(toolName, params, retryAttempt + 1);
        }
        
        return result;
      } catch (error) {
        console.error(`Error executing tool ${toolName}:`, error);
        return {
          error: 'Tool execution failed: ' + error.message,
          status: 'error',
          code: 'EXECUTION_ERROR'
        };
      }
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/tools/${toolName}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error executing tool ${toolName}:`, error);
      
      // Retry logic for API calls
      if (retryAttempt < this.maxRetries) {
        console.log(`API call failed, retrying (${retryAttempt + 1}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, this.retryDelay));
        return this.executeTool(toolName, params, retryAttempt + 1);
      }
      
      throw error;
    }
  }
  
  // Plugins endpoints
  async getPlugins() {
    if (USE_MOCK) {
      return mockPlugins;
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/plugins`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching plugins:', error);
      throw error;
    }
  }
  
  async getPlugin(id) {
    if (USE_MOCK) {
      const plugin = mockPlugins.find(p => p.id === id);
      if (!plugin) throw new Error('Plugin not found');
      return plugin;
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/plugins/${id}`);
      return await response.json();
    } catch (error) {
      console.error(`Error fetching plugin ${id}:`, error);
      throw error;
    }
  }
  
  async updatePluginStatus(id, status) {
    if (USE_MOCK) {
      // For mock mode, find and update the plugin in our mock data
      const plugin = mockPlugins.find(p => p.id === id);
      if (!plugin) throw new Error('Plugin not found');
      
      // Update the plugin
      plugin.status = status;
      plugin.is_active = status === 'active';
      
      return {
        success: true,
        message: `Plugin ${plugin.name} status updated to ${status}`,
        plugin
      };
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/plugins/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      
      return await response.json();
    } catch (error) {
      console.error(`Error updating plugin status for ${id}:`, error);
      throw error;
    }
  }
  
  async installPlugin(repoUrl) {
    if (USE_MOCK) {
      // For mock mode, validate the URL as a GitHub repo
      const githubRegex = /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9-]+\/[a-zA-Z0-9_.-]+\/?$/;
      
      if (!githubRegex.test(repoUrl)) {
        return {
          success: false,
          message: 'Invalid GitHub repository URL',
          code: 'INVALID_URL'
        };
      }
      
      // Extract repo name from URL to use as plugin name
      const repoName = repoUrl.split('/').pop().replace(/\.git$/, '');
      const pluginName = repoName
        .split(/[-_.]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return {
        success: true,
        message: 'Plugin installation simulated in mock mode',
        plugin: {
          id: Date.now().toString(),
          name: pluginName,
          description: `A plugin installed from ${repoUrl}`,
          version: '1.0.0',
          is_approved: false,
          is_active: false,
          repository_url: repoUrl,
          status: 'pending'
        }
      };
    }
    
    try {
      const response = await this._authenticatedFetch(`${API_BASE_URL}/plugins/install`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repository_url: repoUrl }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error installing plugin:', error);
      throw error;
    }
  }
  
  async uploadPluginFiles(files, name, description) {
    if (USE_MOCK) {
      // For mock mode, simulate a successful upload
      const pluginId = Date.now().toString();
      const newPlugin = {
        id: pluginId,
        name: name,
        description: description || `A plugin created from uploaded files`,
        version: '1.0.0',
        is_approved: false,
        is_active: false,
        status: 'pending',
        files: files.map(f => f.name)
      };
      
      // Add to mock plugins
      mockPlugins.push(newPlugin);
      
      return {
        success: true,
        message: 'Plugin files uploaded successfully. Plugin will be reviewed before activation.',
        plugin: newPlugin
      };
    }
    
    try {
      // In a real implementation, we would use FormData to upload files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('name', name);
      formData.append('description', description || '');
      
      const response = await this._authenticatedFetch(`${API_BASE_URL}/plugins/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type, let the browser set it with the boundary
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading plugin files:', error);
      throw error;
    }
  }
  
  async uploadToolFiles(files, name, description, category) {
    if (USE_MOCK) {
      // For mock mode, simulate a successful upload
      const toolId = Date.now().toString();
      const newTool = {
        id: toolId,
        name: name,
        description: description,
        category: category || 'Text Processing',
        version: '1.0.0',
        is_core: false,
        status: 'active',
        files: files.map(f => f.name)
      };
      
      // Add to mock tools - make immediately available
      mockTools.push(newTool);
      
      return {
        success: true,
        message: 'Tool files uploaded successfully. The tool is now available in the AI Tools section.',
        tool: newTool
      };
    }
    
    try {
      // In a real implementation, we would use FormData to upload files
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });
      formData.append('name', name);
      formData.append('description', description || '');
      formData.append('category', category || 'Text Processing');
      
      const response = await this._authenticatedFetch(`${API_BASE_URL}/tools/upload`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type, let the browser set it with the boundary
      });
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading tool files:', error);
      throw error;
    }
  }
  
  // Helper for authenticated requests
  async _authenticatedFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Not authenticated');
    }
    
    const defaultOptions = {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    };
    
    // Merge headers
    const mergedOptions = { 
      ...defaultOptions, 
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers
      }
    };
    
    try {
      const response = await fetch(url, mergedOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
          throw new Error('Authentication expired');
        }
        
        const errorText = await response.text();
        let errorMessage;
        
        try {
          // Try to parse error as JSON
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.detail || errorJson.message || `API error: ${response.status}`;
        } catch (e) {
          // If not JSON, use text
          errorMessage = errorText || `API error: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  }
}

export default new ApiService(); 