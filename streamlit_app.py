import os
import pickle
import numpy as np
import pandas as pd
import streamlit as st

# 1. Page Configuration
st.set_page_config(
    page_title="SmartHealth AI — Intelligent Health Monitoring",
    page_icon="❤️",
    layout="wide",
    initial_sidebar_state="expanded"
)

# 2. Inject Modern CSS Styling (Glassmorphism, Dark Mode, Gradients, Custom Metric Cards)
st.markdown("""
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap" rel="stylesheet">

<style>
    /* Global Theme Overrides */
    .stApp {
        background-color: #060b18;
        color: #e2e8f0;
        font-family: 'Inter', sans-serif;
    }
    
    h1, h2, h3, h4, h5, h6 {
        font-family: 'Outfit', sans-serif !important;
    }
    
    /* Header Container */
    .header-box {
        background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(168,85,247,0.1), rgba(6,182,212,0.08));
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 20px;
        padding: 2rem 2.5rem;
        margin-bottom: 2rem;
        text-align: center;
    }
    .header-title {
        font-size: 2.6rem;
        font-weight: 800;
        background: linear-gradient(135deg, #3b82f6, #a855f7, #06b6d4);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 0.5rem;
    }
    .header-subtitle {
        color: #94a3b8;
        font-size: 1rem;
        max-width: 800px;
        margin: 0 auto 1rem;
    }
    
    /* Glass Cards */
    .glass-card {
        background: rgba(13, 22, 41, 0.75);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 16px;
        padding: 1.5rem;
        margin-bottom: 1.25rem;
        backdrop-filter: blur(12px);
    }
    
    /* Status Badges */
    .badge-healthy {
        background: rgba(16, 185, 129, 0.18);
        color: #10b981;
        border: 1px solid rgba(16, 185, 129, 0.35);
        padding: 0.4rem 1.2rem;
        border-radius: 50px;
        font-weight: 700;
        font-size: 1rem;
        display: inline-block;
    }
    .badge-warning {
        background: rgba(249, 115, 22, 0.18);
        color: #f97316;
        border: 1px solid rgba(249, 115, 22, 0.35);
        padding: 0.4rem 1.2rem;
        border-radius: 50px;
        font-weight: 700;
        font-size: 1rem;
        display: inline-block;
    }
    .badge-critical {
        background: rgba(239, 68, 68, 0.18);
        color: #ef4444;
        border: 1px solid rgba(239, 68, 68, 0.35);
        padding: 0.4rem 1.2rem;
        border-radius: 50px;
        font-weight: 700;
        font-size: 1rem;
        display: inline-block;
    }
    
    /* Custom Metric Tiles */
    .metric-tile {
        background: rgba(17, 29, 53, 0.8);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 14px;
        padding: 1.2rem;
        text-align: center;
    }
    .metric-val {
        font-size: 2.2rem;
        font-weight: 800;
        font-family: 'Outfit', sans-serif;
        line-height: 1;
    }
    .metric-lbl {
        font-size: 0.78rem;
        color: #94a3b8;
        margin-top: 0.4rem;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
</style>
""", unsafe_allow_html=True)

# 3. Load Scikit-Learn PKL Model Artifacts
@st.cache_resource
def load_ml_artifacts():
    dir_path = os.path.dirname(__file__)
    model_path  = os.path.join(dir_path, "heart_disease_model.pkl")
    scaler_path = os.path.join(dir_path, "scaler.pkl")
    
    model, scaler = None, None
    if os.path.exists(model_path):
        with open(model_path, "rb") as f:
            model = pickle.load(f)
    if os.path.exists(scaler_path):
        with open(scaler_path, "rb") as f:
            scaler = pickle.load(f)
            
    return model, scaler

model, scaler = load_ml_artifacts()

# 4. Header Banner
st.markdown("""
<div class="header-box">
    <div style="display:inline-block; background:rgba(59,130,246,0.15); color:#3b82f6; border:1px solid rgba(59,130,246,0.3); border-radius:50px; padding:0.25rem 0.9rem; font-size:0.75rem; font-weight:700; text-transform:uppercase; margin-bottom:0.75rem;">
        ❤️ AI-Powered Cardiovascular Health System
    </div>
    <div class="header-title">SmartHealth AI Dashboard</div>
    <div class="header-subtitle">
        Real-time vital sign analysis, disease risk detection, and physiological monitoring — 
        trained on <strong>920 real UCI patient records</strong> using machine learning.
    </div>
    <div style="font-size:0.8rem; color:#64748b;">
        Dhaka International University | SDM Group B Project | Supervised by Md. Alamgir Hossain
    </div>
</div>
""", unsafe_allow_html=True)

# Initialize Session State for Preset Scenarios
if 'preset_age' not in st.session_state:
    st.session_state.preset_age = 52
    st.session_state.preset_sex = "Male"
    st.session_state.preset_bp = 125
    st.session_state.preset_hr = 155
    st.session_state.preset_exang = "No"
    st.session_state.preset_spo2 = 98
    st.session_state.preset_temp = 36.8

def apply_preset(age, sex, bp, hr, exang, spo2, temp):
    st.session_state.preset_age = age
    st.session_state.preset_sex = sex
    st.session_state.preset_bp = bp
    st.session_state.preset_hr = hr
    st.session_state.preset_exang = exang
    st.session_state.preset_spo2 = spo2
    st.session_state.preset_temp = temp

# Preset Patient Quick Selector Buttons
st.markdown("##### ⚡ Quick Patient Preset Scenarios:")
p_col1, p_col2, p_col3, p_col4 = st.columns(4)
with p_col1:
    if st.button("🟢 Healthy Athlete", use_container_width=True):
        apply_preset(32, "Male", 115, 178, "No", 99, 36.6)
with p_col2:
    if st.button("🟡 Hypertensive Patient", use_container_width=True):
        apply_preset(58, "Female", 145, 142, "No", 95, 37.1)
with p_col3:
    if st.button("🔴 Critical Angina Patient", use_container_width=True):
        apply_preset(65, "Male", 165, 108, "Yes", 91, 38.2)
with p_col4:
    if st.button("🔵 Routine Checkup", use_container_width=True):
        apply_preset(48, "Female", 124, 155, "No", 98, 36.7)

st.markdown("<br>", unsafe_allow_html=True)

# 5. Sidebar Controls (Organized & Clean)
st.sidebar.markdown("### 🎛️ Patient Clinical Parameters")
st.sidebar.caption("Adjust sliders or click a preset above.")

patient_name = st.sidebar.text_input("Patient Full Name", "John Doe")
age = st.sidebar.slider("Age (years)", 18, 90, st.session_state.preset_age)
sex = st.sidebar.radio("Gender", ["Male", "Female"], index=0 if st.session_state.preset_sex == "Male" else 1, horizontal=True)

st.sidebar.markdown("---")
st.sidebar.markdown("##### 🩺 Vital Sign Sensors")
resting_bp = st.sidebar.slider("Resting BP (mmHg)", 80, 200, st.session_state.preset_bp)
max_hr     = st.sidebar.slider("Max Heart Rate (bpm)", 70, 220, st.session_state.preset_hr)
exercise_angina = st.sidebar.selectbox("Exercise-Induced Angina?", ["No", "Yes"], index=0 if st.session_state.preset_exang == "No" else 1)

st.sidebar.markdown("---")
st.sidebar.markdown("##### 🌡️ Physiological Markers")
spo2 = st.sidebar.slider("SpO₂ Blood Oxygen (%)", 80, 100, st.session_state.preset_spo2)
temp = st.sidebar.slider("Body Temperature (°C)", 34.0, 41.0, float(st.session_state.preset_temp), step=0.1)

# Categorical conversion
sex_num   = 1 if sex == "Male" else 0
exang_num = 1 if exercise_angina == "Yes" else 0

# 6. ML Inference Engine Execution
prob = 0.15
prediction = 0

if model is not None and scaler is not None:
    raw_features = np.array([[age, sex_num, resting_bp, max_hr, exang_num]])
    scaled_features = scaler.transform(raw_features)
    prediction = model.predict(scaled_features)[0]
    
    if hasattr(model, "predict_proba"):
        prob = model.predict_proba(scaled_features)[0][1]
    else:
        prob = 0.88 if prediction == 1 else 0.12

# Clinical Rule Overrides (WHO & AHA)
if resting_bp >= 160 or spo2 < 91 or temp > 39.0:
    status_label = "CRITICAL RISK"
    badge_html   = '<span class="badge-critical">🔴 CRITICAL RISK</span>'
    status_color = "#ef4444"
    status_desc  = "Immediate clinical intervention required. High blood pressure or hypoxemia detected."
elif prediction == 1 or resting_bp >= 130 or spo2 < 95 or temp > 37.2 or temp < 36.1:
    status_label = "WARNING / ELEVATED"
    badge_html   = '<span class="badge-warning">🟡 WARNING / ELEVATED RISK</span>'
    status_color = "#f97316"
    status_desc  = "Elevated vital sign markers detected. Medical evaluation and monitoring advised."
else:
    status_label = "HEALTHY / NORMAL"
    badge_html   = '<span class="badge-healthy">🟢 HEALTHY / LOW RISK</span>'
    status_color = "#10b981"
    status_desc  = "All patient vital signs and AI diagnostic parameters are within optimal clinical ranges."

# 7. Main Dashboard Grid
left_col, right_col = st.columns([1.1, 0.9])

with left_col:
    st.markdown("### 📊 AI Diagnosis & Risk Summary")
    
    # Top Metrics Cards
    m1, m2, m3 = st.columns(3)
    with m1:
        st.markdown(f"""
        <div class="metric-tile">
            <div class="metric-val" style="color:{status_color};">{prob*100:.1f}%</div>
            <div class="metric-lbl">AI Disease Risk Score</div>
        </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
        <div class="metric-tile">
            <div class="metric-val" style="color:#3b82f6;">{resting_bp}</div>
            <div class="metric-lbl">Resting BP (mmHg)</div>
        </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
        <div class="metric-tile">
            <div class="metric-val" style="color:#06b6d4;">{spo2}%</div>
            <div class="metric-lbl">SpO₂ Oxygen</div>
        </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Status Banner Card
    st.markdown(f"""
    <div class="glass-card">
        <div style="margin-bottom:0.75rem;">{badge_html}</div>
        <h4 style="margin-bottom:0.4rem; color:#e2e8f0;">Diagnostic Assessment for {patient_name}</h4>
        <p style="color:#94a3b8; font-size:0.9rem; margin-bottom:1rem;">{status_desc}</p>
        <div style="font-size:0.8rem; color:#64748b;">
            Trained Model: <strong>K-Nearest Neighbors (k=5)</strong> | Dataset: <strong>920 UCI Patient Records</strong>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Risk Meter Progress Bar
    st.markdown("##### 🎯 AI Risk Probability Meter:")
    st.progress(float(prob))
    
    # Download Medical Report
    report_text = f"""==================================================
SMARTHEALTH AI — PATIENT MEDICAL DIAGNOSIS REPORT
==================================================
Patient Name: {patient_name}
Age / Sex:    {age} years, {sex}
Date:         2026-07-25

VITAL SIGNS:
• Resting Blood Pressure: {resting_bp} mmHg (Ref: 90-120)
• Max Heart Rate:        {max_hr} bpm (Ref: 60-100)
• Blood Oxygen (SpO2):   {spo2}% (Ref: 95-100%)
• Body Temperature:     {temp} °C (Ref: 36.1-37.2°C)
• Exercise Angina:       {exercise_angina}

AI DIAGNOSTIC ASSESSMENT:
• Risk Status:          {status_label}
• Calculated Disease Probability: {prob*100:.1f}%
• Machine Learning Model: K-Nearest Neighbors (k=5)
• Data Source: UCI Heart Disease Dataset (CC BY 4.0)

clinical notes:
{status_desc}
=================================================="""

    st.download_button(
        label="📄 Download Printable Patient Report (.txt)",
        data=report_text,
        file_name=f"SmartHealth_Report_{patient_name.replace(' ', '_')}.txt",
        mime="text/plain",
        use_container_width=True
    )

with right_col:
    st.markdown("### 📈 Patient Vitals & Clinical Comparison")
    
    # Interactive Vital Breakdown Chart
    vitals_df = pd.DataFrame({
        "Vital Sign": ["Resting BP (mmHg)", "Max Heart Rate (bpm)", "SpO₂ Level (%)", "Temperature (°C × 3)"],
        "Patient Value": [resting_bp, max_hr, spo2, temp * 3],
        "Normal Standard": [120, 100, 98, 36.8 * 3]
    })
    
    st.bar_chart(vitals_df.set_index("Vital Sign"), use_container_width=True)
    
    # Clinical Reference Ranges Table
    st.markdown("##### 📋 Clinical Reference Guidelines:")
    ref_df = pd.DataFrame({
        "Parameter": ["Heart Rate", "SpO₂ Oxygen", "Body Temp", "Blood Pressure"],
        "Normal Range": ["60 - 100 bpm", "95 - 100%", "36.1 - 37.2 °C", "90 - 120 mmHg"],
        "Warning Range": ["40-59 / 101-130", "91 - 94%", "37.3 - 39.0 °C", "121 - 159 mmHg"],
        "Source": ["AHA 2023", "WHO Oximetry", "Elsevier Clinical", "AHA/ACC 2023"]
    })
    st.dataframe(ref_df, hide_index=True, use_container_width=True)

st.divider()

# Footer
st.markdown("""
<div style="text-align:center; color:#64748b; font-size:0.8rem; padding:1rem 0;">
    SmartHealth AI — Intelligent Cardiovascular Health System | Dhaka International University<br/>
    Team: Monira Jahan Dipti (39), MST Laboni Khatun (02), Sharmin Akter (13) | Supervised by Md. Alamgir Hossain
</div>
""", unsafe_allow_html=True)
