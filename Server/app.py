# Server/app.py
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables from .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configure Gemini
if not GEMINI_API_KEY:
    raise RuntimeError("❌ GEMINI_API_KEY missing in Server/.env")
genai.configure(api_key=GEMINI_API_KEY)

# Use latest correct model ID
MODEL_ID = "models/gemini-2.5-flash-preview-05-20"
model = genai.GenerativeModel(MODEL_ID)

@app.get("/health")
def health():
    """Check API health & model"""
    return {"status": "ok", "model": MODEL_ID}

@app.get("/list-models")
def list_models():
    """Debug helper: list available models"""
    models = [m.name for m in genai.list_models()]
    return {"available_models": models}

@app.post("/analyze")
def analyze():
    """Analyze finance data with Gemini"""
    try:
        data = request.get_json(force=True) or {}
        prompt = data.get("prompt", "").strip()
        context = data.get("context", {})

        if not prompt and not context:
            return jsonify({"error": "Provide 'prompt' or 'context'"}), 400

        context_text = f"\n\n[DATA CONTEXT]\n{context}" if context else ""

        response = model.generate_content(
            f"You are a finance assistant. Analyze:\n\n{prompt}{context_text}"
        )

        return jsonify({"result": response.text.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
    @app.route("/retirement-forecast", methods=["POST"]) 
def retirement_forecast():
    try:
        data = request.get_json()
        monthly_saving = float(data.get("monthlySaving", 0))
        current_age = int(data.get("currentAge", 30))
        retirement_age = int(data.get("retirementAge", 60))
        expected_return = float(data.get("expectedReturn", 0.08))  # 8% CAGR default
        inflation = float(data.get("inflation", 0.05))  # 5% default

        # Years until retirement
        years = retirement_age - current_age
        months = years * 12

        # Approximate corpus using compounding
        corpus = 0
        for _ in range(months):
            corpus = (corpus + monthly_saving) * (1 + expected_return / 12)

        # Adjust for inflation
        adjusted_corpus = corpus / ((1 + inflation) ** years)

        # Forecast curve (for chart)
        forecast = []
        balance = 0
        for m in range(months):
            balance = (balance + monthly_saving) * (1 + expected_return / 12)
            forecast.append({
                "ds": (datetime.date.today() + pd.DateOffset(months=m)).strftime("%Y-%m"),
                "yhat": balance
            })

        return jsonify({
            "corpus": round(corpus, 2),
            "inflationAdjustedCorpus": round(adjusted_corpus, 2),
            "forecast": forecast
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
