"""
VyaparSathi Model Evaluation Module
Computes regression (RMSE, MAE, R²) and classification (Accuracy, Macro F1, Weighted F1)
metrics strictly on held-out real test sets.
"""

from typing import Dict, Any
import numpy as np
from sklearn.metrics import (
    mean_squared_error,
    mean_absolute_error,
    r2_score,
    accuracy_score,
    f1_score
)

def evaluate_regression(y_true, y_pred) -> Dict[str, float]:
    """Calculate RMSE, MAE, and R² for regression candidates."""
    y_true_arr = np.array(y_true, dtype=float)
    y_pred_arr = np.array(y_pred, dtype=float)

    rmse = float(np.sqrt(mean_squared_error(y_true_arr, y_pred_arr)))
    mae = float(mean_absolute_error(y_true_arr, y_pred_arr))
    r2 = float(r2_score(y_true_arr, y_pred_arr))

    return {
        "rmse": round(rmse, 2),
        "mae": round(mae, 2),
        "r2_score": round(r2, 4)
    }

def evaluate_classification(y_true, y_pred) -> Dict[str, float]:
    """Calculate Accuracy, Macro F1, and Weighted F1 for classification candidates."""
    acc = float(accuracy_score(y_true, y_pred))
    macro_f1 = float(f1_score(y_true, y_pred, average="macro", zero_division=0))
    weighted_f1 = float(f1_score(y_true, y_pred, average="weighted", zero_division=0))

    return {
        "validation_accuracy": round(acc, 4),
        "f1_macro": round(macro_f1, 4),
        "f1_weighted": round(weighted_f1, 4)
    }
