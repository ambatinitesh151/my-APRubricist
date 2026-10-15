import os
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from google import genai

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY not found. Check your .env file.")

client = genai.Client(api_key=api_key)

app = Flask(__name__)
CORS(app)  # Allows your HTML/JS to talk to this local server

@app.route("/grade", methods=["POST"])
def grade_saq():
    data = request.get_json()
    question = data.get("question", "")
    answer = data.get("answer", "")

    if not question or not answer:
        return jsonify({"error": "Missing question or answer"}), 400

    # Prompt engineered for AP SAQ grading (A/B/C tasks structure)
    prompt = f"""
    You are an expert AP grader. Grade the following Short Answer Question (SAQ) response based on historical accuracy and standard AP grading criteria (evaluating specific tasks if applicable).
    
    Question:
    {question}
    
    Student Answer:
    {answer}
    
    Provide your output in this exact format:
    SCORE: [e.g., 0/3] (maybe 1/3, 2/3, or 3/3 depending on the number of tasks and details that are needed)

    REASONING: [Detailed explanation of why it earned or missed the point based on AP standards]
    """

    try:
        response = client.interactions.create(
            model="gemini-3.8-flash",
            input=prompt
        )
        
        raw_text = response.output_text.strip()
        
        # Simple text splitting to separate score and reasoning
        score = "N/A"
        reasoning = raw_text
        if "SCORE:" in raw_text and "REASONING:" in raw_text:
            parts = raw_text.split("REASONING:")
            score = parts[0].replace("SCORE:", "").strip()
            reasoning = parts[1].strip()

        return jsonify({"score": score, "reasoning": reasoning})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)