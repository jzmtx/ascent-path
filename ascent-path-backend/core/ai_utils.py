import random
import google.generativeai as genai
from decouple import config

class GeminiWrapper:
    def __init__(self, model_name):
        self.model_name = model_name

    def generate_content(self, prompt, **kwargs):
        keys_str = config('GEMINI_API_KEYS', default='')
        keys = [k.strip() for k in keys_str.split(',') if k.strip()]
        if not keys:
            # Fallback to single key if multi-key string is missing
            keys = [config('GEMINI_API_KEY')]
        
        # Shuffle to distribute load randomly
        random.shuffle(keys)
        
        last_error = None
        # Try up to 3 keys per request
        for key in keys[:3]:
            try:
                genai.configure(api_key=key)
                model = genai.GenerativeModel(self.model_name)
                return model.generate_content(prompt, **kwargs)
            except Exception as e:
                last_error = e
                error_str = str(e).lower()
                # Catch 429 Too Many Requests or Quota Exceeded
                if '429' in error_str or 'quota' in error_str or 'exhausted' in error_str:
                    continue  # SILENTLY retry with the next key
                raise e  # If it's a different error (e.g. bad request), throw immediately
                
        # If all keys are exhausted
        raise Exception(f"All available Gemini API keys exhausted or rate-limited. Last error: {last_error}")

def get_gemini_model(model_name='gemini-flash-latest'):
    """
    Returns a wrapped model instance that automatically rotates keys and retries 
    if a Quota Exceeded (429) error occurs.
    """
    return GeminiWrapper(model_name)
