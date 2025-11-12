from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# Load the trained model and scaler from the same directory as app.py
BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, 'credit_model.pkl')
SCALER_PATH = os.path.join(BASE_DIR, 'scaler.pkl')

try:
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    print("✅ Model and scaler loaded successfully!")
except Exception as e:
    print(f"❌ Error loading model: {e}")

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'message': 'ML API is running'})

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        # Use all 23 features in the exact same order as model training
        features = np.array([[
            float(data['LIMIT_BAL']),
            float(data['SEX']),
            float(data['EDUCATION']),
            float(data['MARRIAGE']),
            float(data['AGE']),
            float(data['PAY_0']),
            float(data['PAY_2']),
            float(data['PAY_3']),
            float(data['PAY_4']),
            float(data['PAY_5']),
            float(data['PAY_6']),
            float(data['BILL_AMT1']),
            float(data['BILL_AMT2']),
            float(data['BILL_AMT3']),
            float(data['BILL_AMT4']),
            float(data['BILL_AMT5']),
            float(data['BILL_AMT6']),
            float(data['PAY_AMT1']),
            float(data['PAY_AMT2']),
            float(data['PAY_AMT3']),
            float(data['PAY_AMT4']),
            float(data['PAY_AMT5']),
            float(data['PAY_AMT6'])
        ]])

        # Scale features
        features_scaled = scaler.transform(features)

        # Model prediction
        prediction = model.predict(features_scaled)[0]
        probability = model.predict_proba(features_scaled)[0]

        # Debug print
        print({
            'Received': data,
            'Parsed Features': features.tolist(),
            'Prediction': int(prediction),
            'Default Prob': float(probability[1]),
            'Safe Prob': float(probability[0])
        })

        # Return result
        return jsonify({
            'prediction': int(prediction),
            'default_probability': float(probability[1]),
            'no_default_probability': float(probability[0]),
            'risk_level': 'High' if probability[1] > 0.5 else 'Low'
        })

    except Exception as e:
        print(f"Error in prediction: {e}")
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    print("🚀 Starting ML API Server...")
    print(f"✅ Model loaded from: {MODEL_PATH}")
    print(f"✅ Scaler loaded from: {SCALER_PATH}")
    app.run(host='0.0.0.0', port=5000, debug=False)
