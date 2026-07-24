# Implementation Plan: ML Validation + Real Data

## Goals
1. Fetch 200+ real records from multiple public datasets
2. Implement 4 ML classifiers in JavaScript (Logistic Regression, KNN, Naive Bayes, Decision Tree)
3. Full validation: Confusion Matrix, Precision, Recall, F1-Score, ROC Curves
4. Professional validation dashboard

## Data Sources
- UCI Cleveland (303 records) ✅ fetched
- UCI Heart Disease (processed) — all 4 databases combined
- NHANES public vitals reference
- IoT Health monitoring public data

## ML Models (JavaScript implementation)
- Rule-Based Classifier (current baseline)
- K-Nearest Neighbors (KNN)
- Naive Bayes Gaussian
- Decision Tree (CART-style)
- Weighted Ensemble

## Validation Metrics
- Confusion Matrix (3×3)
- Accuracy, Precision, Recall, F1 per class + macro
- ROC/AUC curves per class (one-vs-rest)
- Learning curve
- Cross-validation (5-fold)
- Cohen's Kappa
