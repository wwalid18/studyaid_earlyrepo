import os
import requests

# === CONFIGURATION ===
GROQ_API_KEY = "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"  # 🔴 REPLACE THIS in real code after testing
MODEL_NAME = "llama3-70b-8192"
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
  
def build_prompt(highlights: list[str]) -> str:
    highlights_text = "\n- ".join(highlights)

    return f"""
You are an expert content summarizer.

Given a list of key highlights selected by a user from various texts or articles, generate a **clear, concise, and informative summary**. The summary should capture the main ideas, insights, and any essential details presented in the highlights.

**Instructions:**
- Summarize only the information provided in the highlights.
- Do not add external knowledge.
- Use clear and professional language.
- Focus on conveying the main points without redundancy.


**Highlights:**
{highlights_text}

**Output:**
A well-structured summary based on the above highlights:
"""

def send_to_groq(prompt):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL_NAME,
        "messages": [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }

    response = requests.post(GROQ_API_URL, headers=headers, json=payload)
    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        print("❌ Error:", response.status_code)
        print(response.text)
        return None

