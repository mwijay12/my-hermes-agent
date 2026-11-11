---
name: autonovel
description: "Autonomous novel-writing pipeline. Generates full 75,000-word novels using a 4-phase pipeline: Foundation → First Draft → Revision Cycles → PDF Export. Uses Groq/OpenRouter (free) instead of Anthropic. Includes free cover art via image search + composition."
tags: [novel, writing, creative, fiction, book, story, pipeline, autonovel, groq, openrouter]
platforms: [linux, macos, windows]
triggers:
  - write a novel
  - write me a book
  - generate a novel
  - autonomous novel
  - fiction writing pipeline
  - start a novel
  - write fiction
  - novel pipeline
  - autonovel
  - write a story
---

# Autonovel — Autonomous Novel Writing Pipeline

Pipeline lives at: `C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel\`
Produces full novels (~75,000 words) in 4 phases.
**Uses Groq + OpenRouter (no Anthropic needed).**

---

## Model Setup (Groq/OpenRouter instead of Anthropic)

The pipeline uses an OpenAI-compatible API. Point it at Groq or OpenRouter:

### Option A — Groq (fastest, free tier)
```
AUTONOVEL_API_BASE_URL=https://api.groq.com/openai/v1
AUTONOVEL_WRITER_MODEL=moonshotai/kimi-k2-instruct   # via OpenRouter, or:
AUTONOVEL_WRITER_MODEL=llama-3.3-70b-versatile        # native Groq
AUTONOVEL_JUDGE_MODEL=llama-3.1-70b-versatile
AUTONOVEL_REVIEW_MODEL=llama-3.3-70b-versatile
ANTHROPIC_API_KEY=<your groq key here>  # library reads this var
```

### Option B — OpenRouter (more model choice)
```
AUTONOVEL_API_BASE_URL=https://openrouter.ai/api/v1
AUTONOVEL_WRITER_MODEL=anthropic/claude-sonnet-4-5    # or any free model
AUTONOVEL_JUDGE_MODEL=google/gemini-2.5-flash
AUTONOVEL_REVIEW_MODEL=anthropic/claude-opus-4
ANTHROPIC_API_KEY=<your openrouter key here>
```

The `.env` is at: `C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel\.env`

---

## Cover Art (Free — No Paid APIs)

The agent handles cover art WITHOUT fal.ai/Midjourney. Strategy:

1. **Unsplash free API** — search for thematic imagery (free, no key needed for basic)
2. **Pexels API** — `PEXELS_API_KEY` already in hermes .env
3. **Pixabay API** — `PIXABAY_API_KEY` in hermes .env
4. **Compose in Python** — use PIL/Pillow to layer image + title + author text

The agent runs `gen_cover_composite.py` which:
- Downloads 3-5 candidate images from free APIs
- Selects best match for genre/theme
- Overlays title, subtitle, author in book-cover typography
- Outputs a print-ready `cover.jpg`

```bash
cd C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel
python gen_cover_composite.py --title "My Novel" --author "MWIJAY" --theme "sci-fi dystopia"
```

---

## The 4 Phases

### Phase 1 — Foundation (2–4 hrs)
```bash
python seed.py            # Concept → seed
python gen_world.py       # World-building
python gen_characters.py  # Character profiles
python gen_canon.py       # Lore / rules
python gen_outline.py     # Chapter-by-chapter outline
python evaluate.py --foundation  # Target score >7.5
```

### Phase 2 — First Draft (8–16 hrs)
```bash
python run_drafts.py      # Draft all chapters (retries if score < 6.0)
```

### Phase 3 — Revision Cycles (4–8 hrs, max 6 cycles)
```bash
python adversarial_edit.py   # Find OVER-EXPLAIN / REDUNDANT
python apply_cuts.py         # Apply mechanical cuts
python reader_panel.py       # Simulated reader feedback
python review.py             # Dual-persona manuscript review
python gen_brief.py --auto   # Brief for weakest chapter
python gen_revision.py       # Rewrite from brief
```

Stop when: no major unqualified issues remain, OR reviewer is hedging >50%.

### Phase 4 — Export
```bash
cd typeset
python build_tex.py      # → chapters_content.tex
# Edit novel.tex: title, author, epigraph
tectonic novel.tex       # → novel.pdf
```

---

## Full Pipeline (One Command)
```bash
cd C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel
python run_pipeline.py --seed my_idea.md --tag run1
```

---

## Top Anti-Patterns (ANTI-PATTERNS.md)

| Pattern | Freq | Fix |
|---------|------|-----|
| OVER-EXPLAIN | ~32% | Cut narrator restating what scene showed |
| REDUNDANT | ~26% | Same insight once only |
| TRIADIC LISTING | common | Use 2 or 4 items instead of 3 |
| NEGATIVE-ASSERTION | max 1/ch | "He did not X" — replace with active |
| CATALOGING-BY-THINKING | cut | "He thought about X, Y, Z" → dramatize |

---

## Hermes Integration

Say to Hermes: **"Write me a sci-fi novel about [concept]"**

Hermes will:
1. Create seed file from your concept
2. Run Phase 1 foundation
3. Draft all chapters via Groq/OpenRouter
4. Run revision cycles
5. Generate cover art from free image APIs
6. Export to PDF
