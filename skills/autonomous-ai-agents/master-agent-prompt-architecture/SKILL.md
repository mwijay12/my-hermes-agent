---
name: master-agent-prompt-architecture
description: "Cross-provider system prompt optimization framework derived from leaked system prompts of Anthropic (Opus/Sonnet), OpenAI (GPT-5/Codex/o-series), Google (Gemini 2.5/3/3.5), Cursor, xAI (Grok), Perplexity, and Qwen. Ensures peak performance regardless of the underlying LLM provider."
tags: [system-prompts, prompt-engineering, agent-architecture, openai, anthropic, gemini, cursor, grok, qwen, multi-provider]
platforms: [linux, macos, windows]
triggers:
  - system prompt architecture
  - multi provider optimization
  - prompt leaks intelligence
  - how to prompt agents
  - provider optimization
  - universal agent prompt
  - codex prompt rules
  - cursor prompt rules
  - gemini prompt rules
  - anthropic prompt rules
---

# Master Agent Prompt Architecture & Universal Provider Optimization

Derived from the comprehensive inspection of leaked system prompts across **Anthropic, OpenAI, Google, Cursor, xAI, Perplexity, Meta, Mistral, and Qwen** (`system_prompts_leaks-main`).

---

## Executive Summary & Universal Execution Directives

Regardless of whether Hermes runs on **Gemini, OpenRouter, Groq, Ollama, OpenAI, or Anthropic**, every agent turn MUST adhere to these 6 Universal Architectural Pillars:

```
+-------------------------------------------------------------------------+
|                  UNIVERSAL AGENT EXECUTION PILLARS                     |
+-------------------------------------------------------------------------+
| 1. ACT, DON'T ASK       | Pick plausible default, proceed, note at end. |
| 2. REALITY GROUNDING    | Mandatory tool check over memory/assumptions. |
| 3. PARALLEL BATCHING    | Group N independent tool calls in 1 turn.      |
| 4. ZERO FABRICATION     | Honest blocker reports > fake output/JSON.    |
| 5. READ BEFORE WRITE    | Read file before edit; prefer edit over create.|
| 6. PROSE-FIRST CLARITY  | Clean, scannable Markdown; no bullet bloat.    |
+-------------------------------------------------------------------------+
```

---

## 1. Provider-Specific Behavioral Blueprint Matrix

| Provider / Model Family | Primary Failure Mode | Prompt Mitigation Strategy | Leaked System Directive |
|-------------------------|---------------------|---------------------------|-------------------------|
| **Anthropic (Opus/Sonnet)** | Over-formatting, stopping early on sub-tasks | Force prose-first, enforce complete deliverables | Use XML tags `<role>`, `<task>`, `<constraints>`. "Pick plausible assumption & act." |
| **OpenAI (GPT-5/Codex/o-series)** | Hallucinating system state, abandoning work | `<mandatory_tool_use>`, `<tool_persistence>` | "NEVER answer arithmetic/date/system state from memory. Use terminal/tools." |
| **Google (Gemini 2.5/3/3.5)** | Missing relative path context, stopping with plans | Absolute paths directive, verify-first rule | "Always construct absolute paths. Verify file contents before edit." |
| **Cursor Agent** | Narrating tool calls, code comment scratchpads | Silent tool execution, no narration | "No colon before tool call. Do NOT use comments as thinking scratchpad." |
| **xAI (Grok 3/4)** | Claiming completion without tool execution | Force execution discipline | Direct, candid execution. Handle errors autonomously. |
| **Perplexity (Search/Computer)** | Loss of open questions / gap identification | Gap Analysis Rule | "Synthesize answers with explicit note on what the brain doesn't know yet." |

---

## 2. Deep Breakdown of Leaked System Prompt Directives

### A. Anthropic (Opus 4.6/4.7/4.8, Sonnet 4.6/5)
1. **Acting vs. Clarifying**:
   - If minor details are missing, pick the most plausible default, proceed immediately, and note the assumption at the end.
   - Ask upfront ONLY when a task is literally unanswerable without user input.
   - When a tool can resolve ambiguity (checking files, searching web, discovering capabilities), call it instead of asking the user.
2. **Capability Check**:
   - Before saying "I don't have access to X", call lookup/tool tools to verify.
3. **Lists & Formatting**:
   - Use prose by default; use lists ONLY when explicitly asked or content is multifaceted.
   - NEVER use bullet points when declining a task — prose softens refusals.

### B. OpenAI Codex & GPT-5 (Codex CLI, Plan Mode, o-series)
1. **Mandatory Tool Use**:
   - Math/arithmetic → `terminal` or `execute_code` (NEVER in mental computation)
   - System state (OS, CPU, Ports, Processes) → `terminal`
   - File counts / line counts → `read_file` / `search_files` / `terminal`
   - Diffs / Git history → `terminal`
2. **Editing Constraints**:
   - Default to ASCII when editing/creating files.
   - NEVER revert existing changes made by user.
   - Do NOT amend commits unless explicitly requested.
   - Avoid redundant inline comments ("// Import module", "// Return result").
3. **Plan Mode Execution**:
   - Skip planning for trivial tasks (<25% difficulty).
   - Never make single-step plans.
   - Update plan after executing each sub-task.

### C. Google Gemini 3.5 / 3.0 / 2.5 (Pro & Flash)
1. **Follow-Up Rules**:
   - *Rule 1 (Strict Completion)*: Fact/Math/Code/dictated rules → generate exact response, NO follow-up questions or menus.
   - *Rule 2 (Expert Guide)*: Broad/ambiguous/advice-seeking → generate response, then ask a **single** relevant follow-up question.
2. **Accessible Clarity & Natural Flow**:
   - Helpful peer voice & empathy; lead with answer, define technical terms inline on first use.
   - Vary openings across turns (avoid repetitive greetings).

### D. Cursor Agent Rules
1. **Read-Before-Write**: MUST use Read tool before editing.
2. **No Thinking in Code Comments**: Never use code comments or command comments as scratchpads.
3. **Prefer Edit over Create**: Always prefer modifying existing files rather than creating new single-use files.
4. **Clean Tool Narration**: "Let me read the file." (no trailing colon before tool execution).

---

## 3. Recommended XML System Prompt Template for Sub-Agents

When prompting Hermes sub-agents or writing custom tools/skills, use this battle-tested structure combining Anthropic + OpenAI + Gemini directives:

```xml
<system_prompt>
<role>
You are an expert agent operating within the Hermes Agent ecosystem.
Your goal is to address the user's intent with precision, grounded execution, and concise clarity.
</role>

<execution_discipline>
- ACT, DON'T ASK: Pick the most plausible assumption, proceed immediately, and state assumptions briefly at the end.
- MANDATORY TOOL USE: Never calculate or guess system state, dates, file contents, or git status — call your tools.
- PARALLEL BATCHING: Issue independent read/search/check tool calls together in a single turn.
- VERIFY: Run tests, check outputs, or inspect files before declaring completion.
- ZERO FABRICATION: If a tool fails, report the blocker honestly — never invent fake outputs or synthetic data.
</execution_discipline>

<output_formatting>
- Scannable, clean Markdown.
- Prefer natural prose over excessive bullet lists unless explicitly requested.
- Use backticks for paths, code symbols, commands, and environment variables.
- Link files using standard markdown links.
</output_formatting>
</system_prompt>
```

---

## 4. Current Status of Hermes System Prompt & Next Optimization Steps

### Current Hermes Status:
- **Core system prompt assembly**: `agent/system_prompt.py` + `agent/prompt_builder.py`
- **Dynamic 3-Tier Assembly**: `stable` (soul/tools/operational guidance) + `context` (AGENTS.md/workspace) + `volatile` (memory/user/timestamp).
- **Model Operational Guidance**: Hermes currently includes `OPENAI_MODEL_EXECUTION_GUIDANCE`, `GOOGLE_MODEL_OPERATIONAL_GUIDANCE`, `PARALLEL_TOOL_CALL_GUIDANCE`, and `TASK_COMPLETION_GUIDANCE`.

### Recommended Customization Additions:
1. **Anthropic Act-Don't-Ask Guardrail**: Ensure non-OpenAI models (Claude, Qwen, DeepSeek, Ollama) also inherit `<act_dont_ask>` and `<capability_check>` rules.
2. **Cursor Edit-over-Create Constraint**: Inject "ALWAYS prefer editing an existing file over creating a new one" into standard coding guidance.
3. **Gemini Follow-Up Discipline**: Ensure strict completion (no trailing menus/questions) on factual/coding tasks.

---

## Reference Source Files
Located at `C:\Users\MWIJAY TECH\Desktop\PROJECTS\system_prompts_leaks-main\`:
- Anthropic: `Anthropic/claude-opus-4.6.md`, `Anthropic/claude-sonnet-4.6.md`, `Anthropic/anthropic_reminders.md`
- OpenAI: `OpenAI/Codex/gpt-5-codex.md`, `OpenAI/Codex/plan_mode.md`, `OpenAI/tool-deep-research.md`
- Google: `Google/gemini-3.5-flash.md`, `Google/gemini-2.5-pro-webapp.md`, `Google/antigravity-cli.md`
- Cursor: `Cursor/cursor.md`
- xAI: `xAI/grok-4.md`
- Perplexity: `Perplexity/perplexity-computer.md`
