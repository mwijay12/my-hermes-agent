---
name: sports-betting-intel-and-prediction
description: |
  Comprehensive sports betting intelligence, multi-source external scraping (Forebet, PredictZ, Vitibet, SportyTrader, FootballPredictions.com, Click4Soccer, FreeSuperTips, Betensured, Football Whispers), odds analysis, consensus aggregation, arbitrage scanning, and Dixon-Coles predictive modeling skill for Hermes.
  Enables the agent to:
  1. Fetch live odds, fixtures, and scores across major leagues (EPL, LaLiga, Serie A, Bundesliga, Ligue 1, NBA).
  2. Scrape and aggregate predictions from top global football prediction sources (Forebet, PredictZ, Vitibet, SportyTrader, FootballPredictions, Click4Soccer, FreeSuperTips, Betensured, Football Whispers).
  3. Compute crowd consensus percentages, agreement vs Dixon-Coles Poisson models, and market value edge anomalies.
  4. Compute Poisson expected goals (xG), score matrix distributions, and multi-market probabilities (1X2, Over/Under 2.5, BTTS).
  5. Calculate fractional Kelly criterion bankroll staking ($f^*$).
  6. Scan multi-sportsbook odds for risk-free Arbitrage opportunities with exact stake sizing.
  7. Run backtesting simulations over historical datasets to calculate ROI, Win Rate, and Max Drawdown.
  8. Query and update the local Hermes Betting SQLite database (hermes.db) and FastAPI backend (http://127.0.0.1:8787).
version: 2.5.0
platforms: [windows, macos, linux]
metadata:
  hermes:
    tags: [sports, betting, odds, predictions, scraper, forebet, predictz, vitibet, sportytrader, value-bet, kelly-criterion, arbitrage, backtesting, soccer, football, analytics]
    category: data-science
    related_skills: [browser, research, data-science]
---

# Unified Sports Betting Intel & Prediction Engine for Hermes

This skill equips Hermes Agent with mathematical models and an independent multi-source prediction scraping suite:
- **`Forebet`**: Mathematical Poisson models, 1X2 probabilities %, predicted exact scores.
- **`PredictZ`**: Daily match predictions, predicted scores (e.g. 2-1, 1-0), and form indicators.
- **`Vitibet`**: Table-driven quick tips, win percentages, and score predictions.
- **`SportyTrader`**: Expert betting previews, match winner picks, and odds comparison.
- **`FootballPredictions.com`**: Expert match tips and accumulators.
- **`Click4Soccer`**: 1X2 predictions and confidence categorizations.
- **`FreeSuperTips`**: Accumulator tips, BTTS bets, and match winner tips.
- **`Betensured & Football Whispers`**: Form analysis and key match forecasts.

---

## 1. Core Endpoints & Database Connection

The Hermes Betting backend runs locally at `http://127.0.0.1:8787` with SQLite database (`hermes.db`).

| Endpoint | Method | Purpose |
|---|---|---|
| `/scrapers/sources` | `GET` | List available scrapers, total matches scraped, and status |
| `/scrapers/run` | `POST` | Trigger scraping across specified or all external platforms |
| `/predictions/external` | `GET` | Query scraped external predictions (by source/league/fixture) |
| `/predictions/consensus` | `GET` | Query aggregated multi-source consensus predictions |
| `/predictions/matrix/{fixture_id}` | `GET` | Side-by-side matrix: Internal Poisson model vs all external sources |
| `/fixtures?days=7` | `GET` | Retrieve upcoming fixtures with live odds and models |
| `/predictions?home={H}&away={A}&league={L}` | `GET` | Run multi-market Poisson + Kelly prediction |
| `/predictions/refresh` | `POST` | Re-run predictions for all upcoming fixtures |
| `/arbitrage` | `POST` | Scan bookmakers for risk-free arbitrage opportunities |
| `/backtest` | `POST` | Run historical backtesting simulation with ROI & drawdown |
| `/news` | `GET` | Retrieve aggregated sports intel and news |

---

## 2. CLI Tool Execution

Hermes Agent can execute the bundled scripts directly:

```powershell
# Scrape all sources and update consensus in hermes.db
python "C:\Users\MWIJAY TECH\AppData\Local\hermes\skills\sports-betting-intel-and-prediction\scripts\scrape_predictions.py" --sources all --days 1

# Scrape specific sources
python "C:\Users\MWIJAY TECH\AppData\Local\hermes\skills\sports-betting-intel-and-prediction\scripts\scrape_predictions.py" --sources forebet,predictz,vitibet

# Get full comparison matrix for a specific fixture ID
python "C:\Users\MWIJAY TECH\AppData\Local\hermes\skills\sports-betting-intel-and-prediction\scripts\scrape_predictions.py" --fixture-id {FIXTURE_ID} --json
```

---

## 3. Decision Framework & Consensus Fusion

- **CONSENSUS STRONG PICK**: Consensus Agreement $\ge 75\%$ across 3+ external sources AND Model Value Edge $\ge +8\%$
- **CONSENSUS PICK**: Consensus Agreement $\ge 60\%$ AND Positive Value Edge ($>0\%$)
- **VALUE ANOMALY**: External consensus disagrees with bookmaker odds pricing (High EV Opportunity)
- **MODEL DIVERGENCE**: Internal Dixon-Coles model detects hidden value where external crowd leans the other way
