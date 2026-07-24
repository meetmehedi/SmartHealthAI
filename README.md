# SmartHealth AI — Smart Health Monitoring System Using AI

> **Software Design & Methodology (Group B) Project**  
> **Institution:** Dhaka International University  
> **Supervisor:** Md. Alamgir Hossain (Lecturer, Dept. of CSE)  
> **Team Members:** Monira Jahan Dipti (39), MST Laboni Khatun (02), Sharmin Akter (13)

---

## 🌟 Overview
**SmartHealth AI** is a modern, web-based, AI-driven vital sign monitoring application designed to detect early cardiovascular and physiological anomalies in real time. It monitors:
- ♥ **Heart Rate (bpm)**
- ◎ **Blood Oxygen (SpO₂ %)**
- 🌡 **Body Temperature (°C)**
- 🩺 **Blood Pressure (mmHg)**

---

## 🚀 Live Demo & Local Launch

### Option 1: Instant Local Launch
Simply double click `index.html` or run:
```bash
python3 -m http.server 8080
```
Then visit: `http://localhost:8080`

### Option 2: Deploy to GitHub Pages (Free)
1. Push this project folder to a GitHub repository.
2. Go to **Repository Settings** ➔ **Pages**.
3. Under **Build and deployment**, set Source to `main` branch `/ (root)`.
4. Click **Save**. Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Option 3: Deploy to Netlify / Vercel (1-Click)
- Drag & drop the project folder directly into [Netlify Drop](https://app.netlify.com/drop) or import to [Vercel](https://vercel.com).

---

## 📂 Project Structure

```
SmartHealthAI/
├── index.html                    # Main UI Dashboard
├── validation.html               # ML Model Validation Suite (920+ real UCI records)
├── style.css                     # Dark-themed Glassmorphism CSS Design System
├── app.js                        # AI Logic Engine, Canvas ECG, Chart.js sparklines
├── README.md                     # Deployment & System Documentation
└── data/
    ├── uci_heart_disease_real.csv # Real UCI Cleveland CSV Dataset
    └── validation_dataset.json   # Enriched JSON dataset with WHO/AHA reference mappings
```

---

## 🔬 Machine Learning Validation
View [`validation.html`](validation.html) for complete benchmarks against **920+ real patient records** from 4 UCI Machine Learning Heart Disease databases (Cleveland, Hungarian, VA Long Beach, Switzerland):

- **Data Partitioning:** **70% Training (~644)** | **15% Validation (~138)** | **15% Holdout Testing (~138)**
- **Classifiers Tested:** Logistic Regression, K-Nearest Neighbors (KNN), Naive Bayes, Decision Tree
- **Metrics Evaluated:** 2×2 & 3×3 Confusion Matrices, Precision, Sensitivity (Recall), Specificity, F1-Score, 5-Fold Cross Validation, Cohen's Kappa, ROC/AUC Curves.
