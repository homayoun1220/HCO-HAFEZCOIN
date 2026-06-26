"""Statistical analysis utilities for HCO human study data."""

from typing import Dict, List, Optional, Union

import numpy as np
import pandas as pd
from scipy import stats


def load_data(db_path: str) -> pd.DataFrame:
    """Load all submitted trials from the SQLite database."""
    import sqlite3

    conn = sqlite3.connect(db_path)
    df = pd.read_sql_query(
        """
        SELECT * FROM trials WHERE status = 'submitted'
        ORDER BY id
        """,
        conn,
    )
    conn.close()
    return df


def _t_ci(values: np.ndarray, confidence: float = 0.95) -> tuple:
    n = len(values)
    if n < 2:
        return (float(np.mean(values)), float(np.mean(values)))
    mean = np.mean(values)
    se = stats.sem(values)
    h = se * stats.t.ppf((1 + confidence) / 2, n - 1)
    return (mean - h, mean + h)


def compute_human_stats(df: pd.DataFrame) -> Dict[str, dict]:
    """Compute per-family statistics for human participants."""
    human_df = df[~df["participant_id"].str.startswith("solver_", na=False)]
    return _compute_group_stats(human_df)


def compute_solver_stats(df: pd.DataFrame, solver_name: str) -> Dict[str, dict]:
    """Compute per-family statistics for a named automated solver."""
    solver_df = df[df["participant_id"] == f"solver_{solver_name}"]
    return _compute_group_stats(solver_df)


def _compute_group_stats(group_df: pd.DataFrame) -> Dict[str, dict]:
    families = ["perceptual", "reasoning", "attention", "biometric"]
    results = {}

    for family in families:
        fam = group_df[group_df["family"] == family]
        if fam.empty:
            results[family] = {
                "n": 0,
                "success_rate": 0.0,
                "success_ci": (0.0, 0.0),
                "mean_latency": 0.0,
                "latency_sd": 0.0,
                "latency_fail_rate": 0.0,
                "correctness_fail_rate": 0.0,
            }
            continue

        passed = fam["passed"].astype(float)
        latencies = fam["latency"].dropna().values
        n = len(fam)

        results[family] = {
            "n": n,
            "success_rate": float(passed.mean()),
            "success_ci": _t_ci(passed.values),
            "mean_latency": float(np.mean(latencies)) if len(latencies) else 0.0,
            "latency_sd": float(np.std(latencies, ddof=1)) if len(latencies) > 1 else 0.0,
            "latency_fail_rate": float(fam["latency_fail"].astype(float).mean()),
            "correctness_fail_rate": float(fam["correctness_fail"].astype(float).mean()),
        }

    return results


def cohens_d(group1: Union[np.ndarray, list], group2: Union[np.ndarray, list]) -> float:
    """Compute Cohen's d effect size between two groups."""
    a = np.asarray(group1, dtype=float)
    b = np.asarray(group2, dtype=float)
    n1, n2 = len(a), len(b)
    if n1 < 2 or n2 < 2:
        return 0.0
    var1, var2 = np.var(a, ddof=1), np.var(b, ddof=1)
    pooled_std = np.sqrt(((n1 - 1) * var1 + (n2 - 1) * var2) / (n1 + n2 - 2))
    if pooled_std == 0:
        return 0.0
    return float((np.mean(a) - np.mean(b)) / pooled_std)


def bonferroni_correction(p_values: List[float]) -> List[float]:
    """Apply Bonferroni correction to a list of p-values."""
    n = len(p_values)
    if n == 0:
        return []
    return [min(p * n, 1.0) for p in p_values]


def print_latex_table(stats: Dict[str, dict]) -> str:
    """Generate LaTeX table code for paper inclusion."""
    lines = [
        r"\begin{table}[ht]",
        r"\centering",
        r"\caption{Human performance by challenge family}",
        r"\begin{tabular}{lcccc}",
        r"\toprule",
        r"Family & Success Rate & 95\% CI & Latency (s) & $n$ \\",
        r"\midrule",
    ]

    for family, s in stats.items():
        ci = s["success_ci"]
        lines.append(
            f"{family.capitalize()} & "
            f"{s['success_rate']:.2f} & "
            f"[{ci[0]:.2f}, {ci[1]:.2f}] & "
            f"{s['mean_latency']:.2f} $\\pm$ {s['latency_sd']:.2f} & "
            f"{s['n']} \\\\"
        )

    lines.extend([
        r"\bottomrule",
        r"\end{tabular}",
        r"\end{table}",
    ])

    latex = "\n".join(lines)
    print(latex)
    return latex


if __name__ == "__main__":
    import sys

    db = sys.argv[1] if len(sys.argv) > 1 else "../backend/hco_study.db"
    df = load_data(db)
    human = compute_human_stats(df)
    print_latex_table(human)
