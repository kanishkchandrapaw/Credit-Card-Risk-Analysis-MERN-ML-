import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

def create_sample_data():
    """Create sample credit card data for demonstration"""
    np.random.seed(42)
    n_samples = 1000
    
    # Create synthetic credit card default data
    data = {
        'LIMIT_BAL': np.random.randint(10000, 500000, n_samples),
        'AGE': np.random.randint(21, 70, n_samples),
        'PAY_0': np.random.randint(-1, 9, n_samples),
        'PAY_2': np.random.randint(-1, 9, n_samples),
        'PAY_3': np.random.randint(-1, 9, n_samples),
        'BILL_AMT1': np.random.randint(0, 100000, n_samples),
        'PAY_AMT1': np.random.randint(0, 50000, n_samples),
        'default': np.random.choice([0, 1], n_samples, p=[0.78, 0.22])
    }
    
    df = pd.DataFrame(data)
    return df

def train_model():
    """Train the credit card default prediction model"""
    print("🚀 Starting model training...")
    
    # Create or load data
    df = create_sample_data()
    print(f"✅ Data loaded: {df.shape}")
    
    # Split features and target
    X = df.drop('default', axis=1)
    y = df['default']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train model
    print("🧠 Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        max_depth=10,
        random_state=42
    )
    model.fit(X_train_scaled, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ Model Accuracy: {accuracy:.2%}")
    
    # Save model and scaler
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/credit_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    print("💾 Model saved successfully!")
    
    return model, scaler, accuracy

if __name__ == "__main__":
    train_model()
