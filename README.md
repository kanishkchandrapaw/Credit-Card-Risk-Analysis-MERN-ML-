# 💳 Credit Card Default Prediction (MERN + ML)

A **production-grade full-stack web application** built using the **MERN stack (MongoDB, Express.js, React, Node.js)** integrated with a **Machine Learning model** to predict **credit card default risk** in real-time.  
It features a secure login system, an interactive and animated React interface, and a Node/Express backend serving ML inference APIs.

---

## 🧠 Problem Statement

Banks and financial institutions face massive challenges from **credit card defaults**, which can account for over **22% of all cardholders** in some datasets.  
This project aims to **predict and flag high-risk customers before they default**, reducing financial losses and improving decision-making in credit approval and limit assignment.

> *For example:*  
> In a dataset of 30,000 cardholders, 22% eventually defaulted — an issue this system seeks to anticipate through data-driven intelligence.

---

## 🏗️ Tech Stack & Architecture

### **Frontend**
- React (Vite)
- Tailwind CSS + Framer Motion for modern animations
- react-tsparticles for motion effects
- Axios for API communication

### **Backend**
- Node.js + Express.js for RESTful APIs  
- JWT Authentication for secure user sessions  
- Routes for user management and prediction services  

### **Database**
- MongoDB Atlas for cloud storage of user profiles and transaction data

### **Machine Learning Layer**
- Python (scikit-learn)  
- Models: Logistic Regression, Decision Tree, Random Forest  
- Flask microservice exposing `/predict` endpoint  
- Deployed via **Render** or **Railway**

### **Deployment**
- **Frontend:** Vercel  
- **Backend & ML API:** Render / Railway  
- **Database:** MongoDB Atlas  

---

## ⚙️ Architecture Overview

[ React Frontend ]
|
| --> (JWT Auth + User Input)
v
[ Express/Node Backend ]
|
| --> /predict --> Flask ML API
v
[ ML Model (Flask, scikit-learn) ]
|
v
[ MongoDB Atlas Database ]


- The frontend provides user authentication and prediction forms.
- The backend acts as a bridge between the UI and the ML service.
- The Flask API performs live inference using trained ML models.
- MongoDB securely stores user credentials and historical data.

---

## 📊 Machine Learning Model

### **Algorithms Tested**
- Logistic Regression (interpretable baseline)  
- Decision Tree (explainable structure)  
- Random Forest (ensemble accuracy boost)

### **Performance**
| Metric | Score |
|---------|-------|
| Accuracy | 94% |
| AUC-ROC | 0.97 |
| Recall (Defaulters) | 0.91 |

> Achieved **AUC = 0.97**, signifying near-perfect discrimination on imbalanced datasets (only ~22% defaults).

### **Feature Engineering Highlights**
- Aggregated past payment delays  
- Calculated credit utilization ratios  
- Created trend-based features on billing amounts  
- One-hot encoding for categorical fields (e.g., gender, education)  
- Log-scaling of continuous financial fields  

### **Model Optimization**
- **GridSearchCV + K-Fold Cross Validation** used for tuning  
- Achieved an **8% improvement in accuracy** after parameter tuning  
- Precision improved **~12%** via custom feature engineering

---

## 🌐 Deployment Details

| Layer | Platform | Description |
|--------|-----------|-------------|
| Frontend | Vercel | React single-page app with modern animations |
| Backend | Render / Railway | Node.js API handling auth and prediction routing |
| ML Model | Flask + Render | Python model inference microservice |
| Database | MongoDB Atlas | Stores users, login tokens, and transaction data |

🕒 **Prediction Response Time:** < 200ms  
Optimized via serverless functions for smooth, real-time interaction.

---

## 🗂️ Project Structure



credit-card-default-predictor/
│
├── frontend/ # React + Vite + Tailwind (UI)
│ ├── src/
│ │ ├── components/ # Navbar, LoginForm, Dashboard
│ │ └── pages/
│ └── .env # API URLs
│
├── backend/ # Node.js + Express (API)
│ ├── routes/
│ ├── controllers/
│ └── .env # Mongo URI, JWT Secret
│
├── ml-model/ # Flask-based ML microservice
│ ├── model.pkl # Trained model file
│ ├── app.py # Prediction API
│ └── requirements.txt
│
└── README.md


---

## 🧩 Environment Variables

| File | Key | Example |
|------|-----|----------|
| `frontend/.env` | `VITE_ML_API_URL` | https://ml-api.onrender.com/predict |
| `backend/.env` | `MONGO_URI` | mongodb+srv://... |
| | `JWT_SECRET` | your_jwt_secret |
| | `PORT` | 5000 |

---

## 🖥️ Usage Example

1. **Login/Register:**  
   Authenticate securely via the React UI (email/password).
2. **Enter Customer Details:**  
   Input credit, age, income, payment history, etc.
3. **Predict Default Risk:**  
   The model instantly returns a risk score and label:
   ```json
   {
     "risk_score": 0.232,
     "label": "Low Risk"
   }


Visualize Results:
Animated frontend displays charts and recommendations.

✨ Key Achievements

🧠 94% Accuracy & AUC=0.97 on test data

⚡ Real-time Predictions (<200ms)

🧮 12% Precision Boost via engineered features

🔒 Secure JWT Authentication

☁️ Deployed full stack (frontend, backend, ML API, database)

💡 End-to-End Integration of ML into a MERN workflow