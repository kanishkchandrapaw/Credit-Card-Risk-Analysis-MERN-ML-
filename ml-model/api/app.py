from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
from typing import List

app = Flask(__name__)

# === CORS configuration ===
# Allow only your Vercel frontend origin for safety.
FRONTEND_ORIGIN = "https://credit-card-risk-analysis-mern-ml.vercel.app"

CORS(
    app,
    origins=[FRONTEND_ORIGIN],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
    supports_credentials=False,
    expose_headers=["Content-Type"],
)

# Paths
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "credit_model.pkl")
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")

model = None
scaler = None

# Load model and scaler
try:
    model = joblib.load(MODEL_PATH)
    app.logger.info("✅ Model loaded from: %s", MODEL_PATH)
except Exception as e:
    app.logger.error("❌ Error loading model: %s", e)

try:
    if os.path.exists(SCALER_PATH):
        scaler = joblib.load(SCALER_PATH)
        app.logger.info("✅ Scaler loaded from: %s", SCALER_PATH)
    else:
        app.logger.warning("⚠️ Scaler file not found, continuing without scaler.")
except Exception as e:
    app.logger.error("❌ Error loading scaler: %s", e)
    scaler = None

# Exact feature order expected by your model (23 features)
EXPECTED_FEATURES: List[str] = [
    "LIMIT_BAL", "SEX", "EDUCATION", "MARRIAGE", "AGE",
    "PAY_0", "PAY_2", "PAY_3", "PAY_4", "PAY_5", "PAY_6",
    "BILL_AMT1", "BILL_AMT2", "BILL_AMT3", "BILL_AMT4", "BILL_AMT5", "BILL_AMT6",
    "PAY_AMT1", "PAY_AMT2", "PAY_AMT3", "PAY_AMT4", "PAY_AMT5", "PAY_AMT6"
]

@app.route("/health", methods=["GET"])
def health():
    status = {
        "status": "healthy" if model is not None else "model_not_loaded",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None
    }
    return jsonify(status), 200

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded on server"}), 503

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 400

    data = request.get_json()

    # Check required fields
    missing = [f for f in EXPECTED_FEATURES if f not in data]
    if missing:
        return jsonify({"error": "missing_fields", "details": missing}), 400

    try:
        # Build features in the correct order
        features = []
        for key in EXPECTED_FEATURES:
            val = data[key]
            # convert strings/numbers to float (raises if not convertible)
            features.append(float(val))

        X = np.array([features])  # shape (1, 23)

        # Scale if scaler present
        if scaler is not None:
            X_scaled = scaler.transform(X)
        else:
            X_scaled = X

        # Predict
        pred = model.predict(X_scaled)
        prediction = int(pred[0])

        # Probabilities: prefer predict_proba, fallback to decision_function or return 0/1
        default_prob = None
        no_default_prob = None

        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(X_scaled)[0]
            no_default_prob = float(probs[0])
            default_prob = float(probs[1])
        elif hasattr(model, "decision_function"):
            score = model.decision_function(X_scaled)[0]
            prob = 1.0 / (1.0 + np.exp(-score))
            default_prob = float(prob)
            no_default_prob = float(1 - prob)
        else:
            default_prob = float(prediction)
            no_default_prob = float(1 - prediction)

        risk_level = "High" if default_prob > 0.5 else "Low"

        response = {
            "prediction": prediction,
            "default_probability": default_prob,
            "no_default_probability": no_default_prob,
            "risk_level": risk_level
        }

        app.logger.info("Prediction request processed: %s", response)
        return jsonify(response), 200

    except Exception as e:
        app.logger.exception("Error during prediction")
        return jsonify({"error": "prediction_error", "message": str(e)}), 400


if __name__ == "__main__":
    # Use Render's provided PORT when running locally for consistency.
    port = int(os.environ.get("PORT", 5000))
    app.logger.info("🚀 Starting ML API Server on port %s ...", port)
    app.run(host="0.0.0.0", port=port, debug=False)
