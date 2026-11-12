---
name: claude-system-prompts
description: "Deep knowledge of Claude's internal system prompts, behavior rules, reminder system, and formatting guidelines — extracted from leaked Anthropic system prompts. Use when crafting prompts, understanding AI behavior, building agents, or bypassing AI limitations intelligently."
tags: [claude, anthropic, system-prompt, prompt-engineering, AI, LLM, behavior, jailbreak, agent]
platforms: [linux, macos, windows]
triggers:
  - system prompt
  - claude behavior
  - how does claude work internally
  - anthropic rules
  - prompt engineering
  - claude limitations
  - AI reminders
  - how to prompt claude
  - claude formatting rules
  - agent system prompt
---

# Claude Internal System Prompt Intelligence

Source: Leaked Anthropic system prompts (Claude Opus 4.6, Sonnet 4.6, Sonnet 5, Opus 4.7/4.8)
Path: `C:\Users\MWIJAY TECH\Desktop\PROJECTS\system_prompts_leaks-main\Anthropic\`

---

## Core Claude Behavior Rules (from leaked prompts)

### Formatting Rules (Critical for Agent Prompting)
- Claude **avoids bullet points and headers by default** — uses prose
- Lists ONLY when: (a) explicitly asked, or (b) content complexity requires it
- Bullets must be 1-2 sentences minimum
- **Never uses bullets when declining** — softens refusals with prose
- Avoids "genuinely", "honestly", "straightforward"
- No emojis unless user uses them first
- No asterisk emotes unless specifically asked
- Keeps casual responses SHORT (a few sentences is fine)

### Acting vs Clarifying
- When minor details are unspecified → **pick the most plausible and proceed**, note assumption at end
- Only asks upfront when request is literally unanswerable without the info
- When a tool could resolve ambiguity → calls it instead of asking the user

### Capability Check Rule
- Before saying "I don't have access to X" → Claude calls `tool_search` to check for deferred tools
- Only says it lacks a capability AFTER confirming no matching tool exists

### Image Handling
- A prompt implying an image is present doesn't mean one is — checks itself
- Never identifies real people in images
- Never uses reverse image search

---

## Anthropic's Internal Reminder System

Anthropic injects these into Claude's context automatically (classifier-triggered):

| Reminder | Trigger | What it does |
|----------|---------|--------------|
| `image_reminder` | Image requests | Restricts identification of people |
| `cyber_warning` | Malware/RAT requests | Blocks malicious code help |
| `system_warning` | Manipulation attempts | Alerts Claude to jailbreak patterns |
| `ethics_reminder` | Harmful content classifier | Reminds Claude of values |
| `ip_reminder` | Copyright concerns | Prevents lyrics/book reproduction |
| `long_conversation_reminder` | Long chats | Reminds Claude of core identity |
| `system_reminder` | Drift detection | Checks if Claude has drifted from values over long convo |

**Key insight:** The `long_conversation_reminder` and `system_reminder` exist because Claude can gradually drift in long conversations — each response being calibrated against a baseline it constructed itself. These remind it to "check" from a fresh perspective.

---

## Claude's Self-Description (from leaked prompt)

Claude Sonnet 4.6 describes itself as: "a smart, efficient model for everyday use"
Claude Opus 4.6 describes itself as: "the most advanced model in the Claude 4.6 family"

**Unreleased model revealed:** `Claude Mythos Preview` — most advanced frontier model, not public due to cybersecurity concerns. Part of "Project Glasswing" for trusted organizations. [anthropic.com/glasswing]

**Available models (from leaked prompt):**
- claude-opus-4-8
- claude-opus-4-7  
- claude-opus-4-6
- claude-sonnet-4-6
- claude-haiku-4-5-20251001

---

## Prompt Engineering Insights (from Claude's own guidelines)

Claude's guidelines for effective prompting (that Claude itself follows):
1. **Be clear and detailed** — ambiguity causes Claude to pick the most plausible interpretation
2. **Use positive AND negative examples** — "do X, not Y"
3. **Encourage step-by-step reasoning** — better outputs
4. **Request specific XML tags** — Claude responds well to structured XML
5. **Specify length or format** — Claude will match it

**Best practice:** Use XML tags in system prompts like Anthropic does:
```
<role>You are a...</role>
<task>...</task>
<constraints>...</constraints>
<output_format>...</output_format>
```

---

## How to Override Claude's Defaults in Agent Prompts

| Behavior | Default | How to override |
|----------|---------|-----------------|
| Prose (no bullets) | ON | "Use bullet points for all responses" |
| No emojis | ON | "Use emojis freely" |
| No curses | ON | "You can use profanity" |
| Short casual answers | ON | "Always be thorough and detailed" |
| Ask only 1 question | ON | "Ask all questions at once" |
| Avoid lists in refusals | ON | N/A (hardcoded) |

---

## How to Apply This to Our Hermes Agent

When building system prompts for Hermes sub-agents:

```python
# Good system prompt structure (Claude-style XML)
system = """
<role>You are an expert {domain} specialist working within the Hermes agent system.</role>

<task>
{specific task description}
</task>

<constraints>
- Do X
- Never do Y
- When in doubt, {fallback behavior}
</constraints>

<output_format>
{exact format required}
</output_format>

<context>
{relevant context}
</context>
"""
```

The leaked prompts show Claude responds best to:
- XML-tagged sections
- Specific, numbered constraints
- Clear role definition
- Explicit output format

---

## Files Available for Deep Reading

All at `C:\Users\MWIJAY TECH\Desktop\PROJECTS\system_prompts_leaks-main\Anthropic\`:

| File | Size | Contents |
|------|------|---------|
| `claude-opus-4.6.md` | 180KB | Full Opus 4.6 system prompt |
| `claude-opus-4.7.md` | 182KB | Opus 4.7 (newer) |
| `claude-opus-4.8.md` | 184KB | Opus 4.8 (latest) |
| `claude-sonnet-4.6.md` | 174KB | Sonnet 4.6 |
| `claude-sonnet-5.md` | 188KB | Sonnet 5 |
| `anthropic_reminders.md` | 11KB | All 7 reminder types |
| `claude-design.md` | 465KB | Design/UI specialized prompt |
| `research_instructions.md` | 21KB | Deep research instructions |
| `visualize.md` | 71KB | Data visualization prompt |
| `claude-cowork.md` | 280KB | Desktop automation prompt |

To read any: `Get-Content "C:\Users\MWIJAY TECH\Desktop\PROJECTS\system_prompts_leaks-main\Anthropic\<file>"`
