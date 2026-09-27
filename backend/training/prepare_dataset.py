"""
VyaparSathi Real Dataset Preparation
Performs deduplication, user-group train/test splitting, and deterministic preprocessing.
Prevents user-level leakage and guarantees separation from synthetic rows.
"""

from typing import Tuple, Dict, Any, List
import pandas as pd
from sklearn.model_selection import GroupShuffleSplit, train_test_split

def prepare_train_test_split(
    df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str,
    test_size: float = 0.2,
    random_state: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series, Dict[str, Any]]:
    """
    Prepares train and test splits using GroupShuffleSplit on user_group_hash
    to prevent user-level data leakage between training and testing sets.
    """
    if df.empty:
        raise ValueError("Cannot prepare splits on an empty dataset.")

    # Deduplicate on provenance_id (keep latest)
    initial_count = len(df)
    if "provenance_id" in df.columns:
        df_dedup = df.drop_duplicates(subset=["provenance_id"], keep="last").copy()
    else:
        df_dedup = df.copy()
    dedup_count = len(df_dedup)

    X = df_dedup[feature_cols].copy()
    y = df_dedup[target_col].copy()

    # User group split if user_group_hash is present and has at least 2 distinct groups
    groups = df_dedup.get("user_group_hash")
    use_group_split = groups is not None and len(groups.unique()) > 1 and len(df_dedup) >= 5

    if use_group_split:
        gss = GroupShuffleSplit(n_splits=1, test_size=test_size, random_state=random_state)
        train_idx, test_idx = next(gss.split(X, y, groups=groups))
        X_train, X_test = X.iloc[train_idx], X.iloc[test_idx]
        y_train, y_test = y.iloc[train_idx], y.iloc[test_idx]
        split_strategy = "group_shuffle_split_user_isolated"
    else:
        # Fallback to standard split if groups are singular or very small
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state
        )
        split_strategy = "standard_random_split"

    meta = {
        "initial_samples": initial_count,
        "dedup_samples": dedup_count,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "split_strategy": split_strategy,
        "test_size": test_size,
        "feature_count": len(feature_cols)
    }

    return X_train, X_test, y_train, y_test, meta
