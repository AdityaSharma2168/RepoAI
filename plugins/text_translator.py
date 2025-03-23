class Plugin:
    """Example plugin for text translation."""
    
    def __init__(self):
        # In a real plugin, you might initialize models or API clients here
        self.languages = {
            "en": "English",
            "es": "Spanish",
            "fr": "French",
            "de": "German",
            "it": "Italian",
            "pt": "Portuguese",
            "ru": "Russian",
            "zh": "Chinese",
            "ja": "Japanese",
            "ko": "Korean",
        }
        
        # Simple translation dictionary (for demo purposes only)
        # A real implementation would use a proper translation service
        self.translations = {
            "hello": {
                "es": "hola",
                "fr": "bonjour",
                "de": "hallo",
                "it": "ciao",
                "pt": "olá",
                "ru": "привет",
                "zh": "你好",
                "ja": "こんにちは",
                "ko": "안녕하세요",
            },
            "goodbye": {
                "es": "adiós",
                "fr": "au revoir",
                "de": "auf wiedersehen",
                "it": "arrivederci",
                "pt": "adeus",
                "ru": "до свидания",
                "zh": "再见",
                "ja": "さようなら",
                "ko": "안녕히 가세요",
            },
            "thank you": {
                "es": "gracias",
                "fr": "merci",
                "de": "danke",
                "it": "grazie",
                "pt": "obrigado",
                "ru": "спасибо",
                "zh": "谢谢",
                "ja": "ありがとう",
                "ko": "감사합니다",
            }
        }
    
    def translate(self, text: str, source_lang: str = "en", target_lang: str = "es") -> dict:
        """
        Translate text from source language to target language.
        
        Args:
            text: Text to translate
            source_lang: Source language code (default: en)
            target_lang: Target language code (default: es)
            
        Returns:
            Dictionary with translation results
        """
        if source_lang not in self.languages:
            raise ValueError(f"Source language '{source_lang}' not supported")
            
        if target_lang not in self.languages:
            raise ValueError(f"Target language '{target_lang}' not supported")
            
        # Simple word-by-word translation (for demo purposes)
        words = text.lower().split()
        translated_words = []
        
        for word in words:
            if word in self.translations and target_lang in self.translations[word]:
                translated_words.append(self.translations[word][target_lang])
            else:
                # If no translation is available, keep the original word
                translated_words.append(f"[{word}]")
                
        translated_text = " ".join(translated_words)
        
        return {
            "source_text": text,
            "source_lang": self.languages[source_lang],
            "target_lang": self.languages[target_lang],
            "translated_text": translated_text
        }
    
    def get_supported_languages(self) -> dict:
        """
        Get a list of supported languages.
        
        Returns:
            Dictionary of language codes and names
        """
        return self.languages 