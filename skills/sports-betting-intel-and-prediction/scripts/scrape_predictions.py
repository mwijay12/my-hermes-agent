#!/usr/bin/env python3
"""
skills/sports-betting-intel-and-prediction/scripts/scrape_predictions.py
Hermes Agent Tool script for scraping and aggregating football predictions.
Can be invoked directly by Hermes Agent or from terminal.
"""
import sys
import os
import argparse
import asyncio
import json
from pathlib import Path

# Ensure UTF-8 stdout
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

# Point to backend directory
WORKSPACE_BACKEND = Path(r"c:\Users\MWIJAY TECH\Hermes Betting\hermes-backend")
if str(WORKSPACE_BACKEND) not in sys.path:
    sys.path.insert(0, str(WORKSPACE_BACKEND))

try:
    from scrapers.runner import scrape_all_sources, SCRAPERS_REGISTRY
    from database import init_db, get_consensus_predictions, get_scraped_predictions, get_fixture_matrix
except ImportError as e:
    print(f"Error loading Hermes backend modules: {e}")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(description="Hermes Agent Prediction Scraper & Consensus CLI")
    parser.add_argument("--sources", type=str, default="all", help="Comma-separated sources or 'all'")
    parser.add_argument("--days", type=int, default=1, help="Days ahead (1=today & tomorrow)")
    parser.add_argument("--fixture-id", type=str, help="Specific fixture ID to get comparison matrix for")
    parser.add_argument("--consensus-only", action="store_true", help="Print only consensus predictions")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    
    args = parser.parse_args()
    init_db()

    if args.fixture_id:
        matrix = get_fixture_matrix(args.fixture_id)
        if args.json:
            print(json.dumps(matrix, indent=2, ensure_ascii=False))
        else:
            fix = matrix.get("fixture", {})
            print(f"\n=== Prediction Matrix for {fix.get('home', 'Home')} vs {fix.get('away', 'Away')} ===")
            print(f"Internal Dixon-Coles Model: {matrix.get('internal_model', {}).get('verdict', 'N/A')} ({matrix.get('internal_model', {}).get('confidence', 0)}%)")
            print(f"External Sources ({len(matrix.get('external_sources', []))}):")
            for ext in matrix.get("external_sources", []):
                print(f"  • {ext['source']}: Pick {ext['prediction_tip']} (Score: {ext.get('predicted_score', '-')}) - {ext.get('confidence', 60)}% conf")
            cons = matrix.get("consensus", {})
            if cons:
                print(f"Consensus: {cons.get('consensus_pick')} ({cons.get('consensus_pct')}% agreement across {cons.get('sources_count')} sources)")
        return

    # Run scraping
    sources_list = list(SCRAPERS_REGISTRY.keys()) if args.sources == "all" else [s.strip() for s in args.sources.split(",")]
    result = asyncio.run(scrape_all_sources(sources=sources_list, days_ahead=args.days, save_to_db=True))

    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
        return

    print(f"\n[Hermes Agent Scraper] Scraped {result['total_scraped']} predictions across {len(result['source_breakdown'])} sources.")
    print("--- Top Consensus Bets ---")
    for c in sorted(result.get("consensus", []), key=lambda x: (x.get("sources_count", 0), x.get("consensus_pct", 0)), reverse=True)[:10]:
        agree = "✓ Agreed with ML model" if c.get("internal_agreement") else ""
        print(f"• {c['home_team']} vs {c['away_team']}: {c['consensus_pick']} ({c['consensus_pct']}% / {c['sources_count']} sources) Score: {c['consensus_score']} {agree}")

if __name__ == "__main__":
    main()
