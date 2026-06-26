import os
import google.generativeai as genai  # pyright: ignore[reportMissingImports]
from dotenv import load_dotenv  # pyright: ignore[reportMissingImports]

load_dotenv()

genai.configure(api_key=os.getenv("GENAI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")

def ask_gemini(prompt: str) -> str:
    response = model.generate_content(
        prompt,
        generation_config={
            'temperature': 0.7,
            'max_output_tokens': 512,
        },
    )

    text = getattr(response, 'text', '') or ''
    if not text and getattr(response, 'parts', None):
        text = ''.join(getattr(part, 'text', '') for part in response.parts)

    if not text:
        raise RuntimeError('Gemini returned an empty response.')

    return text