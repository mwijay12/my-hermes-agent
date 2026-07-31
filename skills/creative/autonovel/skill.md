---
name: autonovel
description: "Autonomous novel-writing pipeline. Generates full 75,000-word novels using a 4-phase pipeline: Foundation → First Draft → Revision Cycles → PDF Export. Powered by NousResearch/autonovel."
tags: [novel, writing, creative, fiction, book, story, pipeline, autonovel]
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
---

# Autonovel — Autonomous Novel Writing Pipeline

The autonovel pipeline lives at: `C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel\`

It produces full novels (~75,000 words) in 4 phases using Claude/Anthropic models.
Timeline: ~15–30 hours of API time per novel.

---

## Setup (First Time Only)

```bash
cd C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel
uv sync
# Copy .env.example to .env and fill in API keys
copy .env.example .env
```

Required keys in `.env`:
- `ANTHROPIC_API_KEY` — for Claude (writer + judge + reviewer)
- `FAL_KEY` — optional, for cover art generation
- `ELEVENLABS_API_KEY` — optional, for audiobook generation

Model defaults (can override in `.env`):
- Writer: `claude-sonnet-4-6`
- Judge: `claude-sonnet-4-6`
- Reviewer: `claude-opus-4-6`

---

## The 4 Phases

### Phase 1 — Foundation (2–4 hours)
Build the world, characters, and outline before writing a word.

```bash
python seed.py          # Create initial seed from a concept
python gen_world.py     # World-building pass
python gen_characters.py # Character profiles
python gen_canon.py     # Lore / rules of the world
python gen_outline.py   # Full chapter-by-chapter outline
python evaluate.py --foundation  # Score: target >7.5 on all dimensions
```

Iterate until foundation scores ≥ 7.5 on all dimensions.

### Phase 2 — First Draft (8–16 hours)
Draft all chapters sequentially. Each chapter is scored; retry if < 6.0.

```bash
python draft_chapter.py --chapter 1
python evaluate.py --chapter 1
# ... repeat for all chapters
# OR run the full pipeline:
python run_drafts.py
```

### Phase 3 — Revision Cycles (4–8 hours)
Up to 6 revision cycles. Stop when no major unqualified issues remain.

```bash
python adversarial_edit.py   # Find OVER-EXPLAIN / REDUNDANT patterns
python apply_cuts.py         # Apply mechanical cuts
python reader_panel.py       # Simulated reader panel feedback
python review.py             # Full dual-persona manuscript review
python gen_brief.py --auto   # Auto-generate revision brief for weakest chapter
python gen_revision.py       # Rewrite chapter from brief
```

### Phase 4 — Export
```bash
cd typeset
python build_tex.py     # Compile to LaTeX
# Edit novel.tex: set title, author, epigraph
tectonic novel.tex      # Render to PDF
```

---

## Quick Start — Full Pipeline

```bash
cd C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel
python run_pipeline.py --seed my_novel_idea.md --tag run1
```

---

## Key Files

| File | Purpose |
|------|---------|
| `seed.py` | Create a novel seed from a concept |
| `gen_outline.py` | Generate full chapter outline |
| `draft_chapter.py` | Draft a single chapter |
| `run_drafts.py` | Draft all chapters sequentially |
| `evaluate.py` | Score chapters / foundation |
| `adversarial_edit.py` | Find prose anti-patterns |
| `apply_cuts.py` | Apply cuts from edit log |
| `reader_panel.py` | Simulate reader feedback |
| `review.py` | Deep dual-persona manuscript review |
| `gen_revision.py` | Rewrite a chapter from a brief |
| `run_pipeline.py` | Full end-to-end orchestrator |
| `chapters/` | All chapter markdown files |
| `state.json` | Pipeline state tracking |

---

## Top Prose Anti-Patterns to Avoid (from ANTI-PATTERNS.md)

1. **OVER-EXPLAIN** (~32% of cuts) — narrator restates what scene already showed. Cut it.
2. **REDUNDANT** (~26%) — same insight 3-4 times. Once is enough.
3. **TRIADIC LISTING** — AI defaults to groups of 3. Use 2 or 4.
4. **NEGATIVE-ASSERTION REPETITION** — "He did not X" max 1 per chapter.
5. **CATALOGING-BY-THINKING** — "He thought about X. He thought about Y."

---

## Connection to Hermes

Autonovel runs via the `.venv` in its own folder using `uv sync`.
API keys are shared via a symlinked or copied `.env`.
To let Hermes drive a novel session, have Hermes run the pipeline scripts
in `C:\Users\MWIJAY TECH\AppData\Local\hermes\autonovel\` using bash/shell tools.

Example Hermes command that triggers this skill:
> "Write me a sci-fi novel about a memory trader in Lagos 2089"

Hermes will:
1. Create a seed file from the concept
2. Run Phase 1 foundation generation
3. Draft all chapters
4. Run revision cycles
5. Export to PDF
