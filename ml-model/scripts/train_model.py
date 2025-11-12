import os
import numpy as np
import pandas as pd

def create_synthetic_credit_data(n_rows=100000):
    np.random.seed(42)
    df = pd.DataFrame({
        'LIMIT_BAL': np.random.randint(10000, 1000000, n_rows),
        'SEX': np.random.randint(1, 3, n_rows),
        'EDUCATION': np.random.randint(1, 5, n_rows),
        'MARRIAGE': np.random.randint(1, 4, n_rows),
        'AGE': np.random.randint(18, 75, n_rows),
        'PAY_0': np.random.randint(-2, 9, n_rows),
        'PAY_2': np.random.randint(-2, 9, n_rows),
        'PAY_3': np.random.randint(-2, 9, n_rows),
        'PAY_4': np.random.randint(-2, 9, n_rows),
        'PAY_5': np.random.randint(-2, 9, n_rows),
        'PAY_6': np.random.randint(-2, 9, n_rows),
        'BILL_AMT1': np.random.randint(0, 1000000, n_rows),
        'BILL_AMT2': np.random.randint(0, 1000000, n_rows),
        'BILL_AMT3': np.random.randint(0, 1000000, n_rows),
        'BILL_AMT4': np.random.randint(0, 1000000, n_rows),
        'BILL_AMT5': np.random.randint(0, 1000000, n_rows),
        'BILL_AMT6': np.random.randint(0, 1000000, n_rows),
        'PAY_AMT1': np.random.randint(0, 100000, n_rows),
        'PAY_AMT2': np.random.randint(0, 100000, n_rows),
        'PAY_AMT3': np.random.randint(0, 100000, n_rows),
        'PAY_AMT4': np.random.randint(0, 100000, n_rows),
        'PAY_AMT5': np.random.randint(0, 100000, n_rows),
        'PAY_AMT6': np.random.randint(0, 100000, n_rows),
    })
    # Toy logic for default label
    df['default.payment.next.month'] = (
        ((df['PAY_0'] > 2) | (df['AGE'] < 26) | (df['LIMIT_BAL'] < 80000) | (df['BILL_AMT1'] > 300000))
        | (np.random.rand(n_rows) < 0.2)
    ).astype(int)
    return df

def load_or_generate_data():
    data_path = "data/raw/credit_card_data.csv"
    if os.path.exists(data_path):
        df = pd.read_csv(data_path)
        print(f"Loaded real data: {df.shape}")
    else:
        print("CSV not found, generating synthetic dataset with 100,000+ rows...")
        df = create_synthetic_credit_data(n_rows=100000)
        print(f"Synthetic data shape: {df.shape}")
        print(df['default.payment.next.month'].value_counts())
    return df

def train_model():
    print("🚀 Starting model training...")

    df = load_or_generate_data()

    features = [
        'LIMIT_BAL', 'SEX', 'EDUCATION', 'MARRIAGE', 'AGE',
        'PAY_0', 'PAY_2', 'PAY_3', 'PAY_4', 'PAY_5', 'PAY_6',
        'BILL_AMT1', 'BILL_AMT2', 'BILL_AMT3', 'BILL_AMT4', 'BILL_AMT5', 'BILL_AMT6',
        'PAY_AMT1', 'PAY_AMT2', 'PAY_AMT3', 'PAY_AMT4', 'PAY_AMT5', 'PAY_AMT6'
    ]
    target = "default.payment.next.month"

    X = df[features]
    y = df[target]

    from sklearn.model_selection import train_test_split
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    from sklearn.metrics import accuracy_score, classification_report
    import joblib

    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Scale features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train model
    print("🧠 Training Random Forest model...")
    model = RandomForestClassifier(
        n_estimators=100,
        class_weight='balanced',
        random_state=42
    )
    model.fit(X_train_scaled, y_train)

    # Evaluate
    y_pred = model.predict(X_test_scaled)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"✅ Model Accuracy: {accuracy:.2%}")
    print(classification_report(y_test, y_pred))

    # Save model and scaler
    models_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
    os.makedirs(models_dir, exist_ok=True)

    model_path = os.path.join(models_dir, 'credit_model.pkl')
    scaler_path = os.path.join(models_dir, 'scaler.pkl')

    joblib.dump(model, model_path)
    joblib.dump(scaler, scaler_path)
    print(f"💾 Model saved to {model_path}")
    print(f"💾 Scaler saved to {scaler_path}")
    return model, scaler, accuracy

if __name__ == "__main__":
    train_model()
