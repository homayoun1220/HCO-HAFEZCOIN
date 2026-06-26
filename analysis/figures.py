"""Figure generation for HCO human study paper."""

import os
from typing import Dict, Optional

import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns

from stats import compute_human_stats, compute_solver_stats, load_data

plt.rcParams.update({
    "font.family": "serif",
    "font.size": 10,
    "axes.labelsize": 11,
    "axes.titlesize": 12,
    "figure.dpi": 150,
    "savefig.dpi": 300,
    "savefig.bbox": "tight",
})

FAMILIES = ["perceptual", "reasoning", "attention", "biometric"]
FAMILY_LABELS = ["Perceptual", "Reasoning", "Attention", "Biometric"]
OUTPUT_DIR = os.environ.get("HCO_FIGURES_DIR", "figures")


def plot_success_rates(
    human_stats: Dict[str, dict],
    solver_stats: Dict[str, dict],
    output_path: Optional[str] = None,
) -> str:
    """Grouped bar chart: human vs best solver success rate per family."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = output_path or os.path.join(OUTPUT_DIR, "success_rates.pdf")

    x = np.arange(len(FAMILIES))
    width = 0.35

    human_rates = [human_stats[f]["success_rate"] for f in FAMILIES]
    solver_rates = [solver_stats[f]["success_rate"] for f in FAMILIES]

    fig, ax = plt.subplots(figsize=(6, 4))
    ax.bar(x - width / 2, human_rates, width, label="Human", color="#00d4aa", edgecolor="black", linewidth=0.5)
    ax.bar(x + width / 2, solver_rates, width, label="Best Solver", color="#ff6b6b", edgecolor="black", linewidth=0.5)

    ax.set_ylabel("Success Rate")
    ax.set_xticks(x)
    ax.set_xticklabels(FAMILY_LABELS)
    ax.set_ylim(0, 1.05)
    ax.legend()
    ax.set_title("Success Rates: Human vs. Automated Solver")
    ax.yaxis.grid(True, alpha=0.3)

    fig.savefig(path, format="pdf")
    plt.close(fig)
    return path


def plot_latency_distribution(
    df: pd.DataFrame,
    output_path: Optional[str] = None,
) -> str:
    """Violin plot of response latencies, human vs solvers."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = output_path or os.path.join(OUTPUT_DIR, "latency_distribution.pdf")

    plot_df = df.copy()
    plot_df["group"] = plot_df["participant_id"].apply(
        lambda p: "Human" if not str(p).startswith("solver_") else "Solver"
    )

    fig, ax = plt.subplots(figsize=(7, 4))
    sns.violinplot(
        data=plot_df,
        x="family",
        y="latency",
        hue="group",
        split=True,
        palette={"Human": "#00d4aa", "Solver": "#ff6b6b"},
        ax=ax,
        order=FAMILIES,
    )
    ax.set_xlabel("Challenge Family")
    ax.set_ylabel("Response Latency (s)")
    ax.set_title("Latency Distribution by Family")
    ax.set_xticklabels(FAMILY_LABELS)

    fig.savefig(path, format="pdf")
    plt.close(fig)
    return path


def plot_failure_breakdown(
    df: pd.DataFrame,
    output_path: Optional[str] = None,
) -> str:
    """Stacked bar: latency fail vs correctness fail per solver/group."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    path = output_path or os.path.join(OUTPUT_DIR, "failure_breakdown.pdf")

    plot_df = df.copy()
    plot_df["group"] = plot_df["participant_id"].apply(
        lambda p: "Human" if not str(p).startswith("solver_") else str(p).replace("solver_", "Solver: ")
    )

    groups = plot_df["group"].unique()
    latency_rates = []
    correctness_rates = []

    for g in groups:
        gdf = plot_df[plot_df["group"] == g]
        n = len(gdf) or 1
        latency_rates.append(gdf["latency_fail"].astype(float).sum() / n)
        correctness_rates.append(gdf["correctness_fail"].astype(float).sum() / n)

    fig, ax = plt.subplots(figsize=(6, 4))
    x = np.arange(len(groups))
    ax.bar(x, latency_rates, label="Latency Fail", color="#ff4444", edgecolor="black", linewidth=0.5)
    ax.bar(x, correctness_rates, bottom=latency_rates, label="Correctness Fail", color="#ffaa00", edgecolor="black", linewidth=0.5)

    ax.set_ylabel("Failure Rate")
    ax.set_xticks(x)
    ax.set_xticklabels(groups, rotation=15, ha="right")
    ax.legend()
    ax.set_title("Failure Breakdown by Group")
    ax.yaxis.grid(True, alpha=0.3)

    fig.savefig(path, format="pdf")
    plt.close(fig)
    return path


def generate_all_figures(db_path: str, solver_name: str = "baseline") -> Dict[str, str]:
    """Generate all paper figures from database."""
    df = load_data(db_path)
    human = compute_human_stats(df)
    solver = compute_solver_stats(df, solver_name)

    return {
        "success_rates": plot_success_rates(human, solver),
        "latency_distribution": plot_latency_distribution(df),
        "failure_breakdown": plot_failure_breakdown(df),
    }


if __name__ == "__main__":
    import sys

    db = sys.argv[1] if len(sys.argv) > 1 else "../backend/hco_study.db"
    paths = generate_all_figures(db)
    for name, path in paths.items():
        print(f"{name}: {path}")
