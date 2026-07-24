import os
import pickle
import numpy as np
import pandas as pd
import streamlit as st

# Set Streamlit Page Config
st.set_page_config(
    page_title="SmartHealth AI — Health Monitoring System",
    page_icon="❤️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for Glassmorphism Styling
st.markdown("""
<style>
    .main { background-color: #060b18; color: #e2e8f0; }
    .stApp { background: #060b18; }
    .card {
        background: rgba(13,22,41,0.85);
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
    }
    .badge-healthy {
        background: rgba(16,185,129,0.2); color: #10b981;
        padding: 0.35rem 1rem; border-radius: 50px; font-weight: 700;
        border: 1px solid rgba(16,185,129,0.4);
    }
    .badge-warning {
        background: rgba(249,115,22,0.2); color: #f97316;
        padding: 0.35rem 1rem; border-radius: 50px; font-weight: 700;
        border: 1px solid rgba(249,115,22,0.4);
    }
    .badge-critical {
        background: rgba(239,68,68,0.2); color: #ef4444;
        padding: 0.35rem 1rem; border-radius: 50px; font-weight: 700;
        border: 1px solid rgba(239,68,68,0.4);
    }
</style>
""", unsafe_allow_html=True)

# 1. Load Model Artifacts (.pkl)
@st.cache_resource
def load_ml_artifacts():
    dir_path = os.path.dirname(__file__)
    model_path  = os.path.join(dir_path, "heart_disease_model.pkl")
    scaler_path = os.path.join(dir_path, "scaler.pkl")
    
    model = None
    scaler = None
    
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
            
    if os.path.exists(scaler_path):
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
            
    return model, scaler

model, scaler = load_ml_artifacts()

# Title Header
st.title("❤️ SmartHealth AI — Health Monitoring System")
st.markdown("""
> **Software Design & Methodology (Group B Project)** — Dhaka International University  
> **Supervisor:** Md. Alamgir Hossain (Lecturer, Dept. of CSE)  
> **Team:** Monira Jahan Dipti (39) | MST Laboni Khatun (02) | Sharmin Akter (13)
""")
st.divider()

# Sidebar - Patient Input
st.sidebar.header("👤 Patient Clinical Inputs")

age = st.sidebar.slider("Age (years)", 18, 90, 52)
sex = st.sidebar.radio("Gender", ["Male", "Female"])
resting_bp = st.sidebar.slider("Resting Blood Pressure (mmHg)", 80, 200, 125)
max_hr = st.sidebar.slider("Maximum Heart Rate Achieved (bpm)", 70, 210, 160)
exercise_angina = st.sidebar.selectbox("Exercise-Induced Angina?", ["No", "Yes"])
spo2 = st.sidebar.slider("SpO₂ Blood Oxygen (%)", 80, 100, 98)
temp = st.sidebar.slider("Body Temperature (°C)", 34.0, 41.0, 36.8, step=0.1)

# Convert categorical inputs
sex_num = 1 if sex == "Male" else 0
exang_num = 1 if exercise_angina == "Yes" else 0

# Main Area Layout
col1, col2 = st.columns([1, 1])

with col1:
    st.subheader("🩺 Patient Vital Signs Summary")
    st.write(f"• **Age / Sex:** {age} years, {sex}")
    st.write(f"• **Resting Blood Pressure:** `{resting_bp} mmHg`")
    st.write(f"• **Max Heart Rate:** `{max_hr} bpm`")
    st.write(f"• **SpO₂ Level:** `{spo2}%`")
    st.write(f"• **Body Temperature:** `{temp} °C`")
    st.write(f"• **Exercise Angina:** `{exercise_angina}`")

with col2:
    st.subheader("🤖 AI Disease Risk Assessment")
    
    if model is not None and scaler is not None:
        # Scale features & Predict
        raw_features = np.array([[age, sex_num, resting_bp, max_hr, exang_num]])
        scaled_features = scaler.transform(raw_features)
        
        prediction = model.predict(scaled_features)[0]
        
        # Get Probability if model supports it
        prob = 0.5
        if hasattr(model, "predict_proba"):
            prob = model.predict_proba(scaled_features)[0][1]
        else:
            prob = 0.85 if prediction == 1 else 0.15

        # Risk Decision logic combined with WHO/AHA Vitals
        if resting_bp >= 160 or spo2 < 91 or temp > 39.0:
            status_text = "Critical Risk"
            badge_cls = "badge-critical"
            alert_fn = st.error
        elif prediction == 1 or resting_bp >= 130 or spo2 < 95 or temp > 37.2 or temp < 36.1:
            status_text = "Warning / Elevated Risk"
            badge_cls = "badge-warning"
            alert_fn = st.warning
        else:
            status_text = "Healthy / Low Risk"
            badge_cls = "badge-healthy"
            alert_fn = st.success

        st.markdown(f"### Status: <span class='{badge_cls}'>{status_text}</span>", unsafe_allow_html=True)
        st.markdown(f"**AI Risk Score:** `{prob*100:.1f}%` Probability")
        
        st.progress(float(prob))

        alert_fn(f"**Clinical Note:** Risk probability calculated at {prob*100:.1f}% based on UCI trained {type(model).__name__}.")
    else:
        st.info("⚠️ ML Model `.pkl` file loading... Run `python3 train_models.py` to generate `.pkl` files.")

st.divider()

# Charts & Analysis
st.subheader("📊 Patient Vitals Breakdown")
chart_data = pd.DataFrame({
    'Metric': ['Resting BP (mmHg)', 'Max HR (bpm)', 'SpO₂ (%)', 'Temp (°C * 3)'],
    'Value': [resting_bp, max_hr, spo2, temp * 3]
})
st.bar_chart(chart_data.set_index('Metric'))

st.caption("SmartHealth AI — Streamlit Deployment | Trained on 920 Real UCI Patient Records")
