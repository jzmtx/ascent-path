import random
import google.generativeai as genai
from decouple import config

def get_gemini_model(model_name='gemini-flash-latest'):
    """
    Returns a configured Gemini model instance using a rotated API key.
    Expects GEMINI_API_KEYS in .env as a comma-separated string.
    Falls back to GEMINI_API_KEY if the multi-key string is missing.
    """
    keys_str = config('GEMINI_API_KEYS', default='')
    if not keys_str:
        # Fallback to single key
        active_key = config('GEMINI_API_KEY')
    else:
        # Split and pick a random key (better distribution than Round Robin for stateless server)
        keys = [k.strip() for k in keys_str.split(',') if k.strip()]
        if not keys:
            active_key = config('GEMINI_API_KEY')
        else:
            active_key = random.choice(keys)

    genai.configure(api_key=active_key)
    return genai.GenerativeModel(model_name)
