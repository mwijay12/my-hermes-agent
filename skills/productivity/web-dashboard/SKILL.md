---
name: web-dashboard
description: "Hermes Web UI Dashboard control and transition guide. Learn how to launch, control, and transition from Terminal/TUI to the Web UI Dashboard at http://127.0.0.1:9119 to manage Profiles, Sessions, Channels, Models, Cron, MCP, Webhooks, Skills, and Logs."
tags: [web, dashboard, ui, terminal-to-web, profiles, models, mcp, cron, webhooks, skills]
platforms: [linux, macos, windows]
triggers:
  - open web
  - open web ui
  - launch dashboard
  - web dashboard
  - open dashboard
  - open web controls
  - go to web interface
  - manage profiles web
  - web ui
---

# Hermes Web UI Dashboard — Complete Guide

The Hermes Web UI is served at **`http://127.0.0.1:9119`**.

You can ask Hermes in Terminal/TUI to open the web UI at any time using:
> *"Open web dashboard"* or *"Launch the web UI"* or *"Go to model controls on web"*

Hermes will execute the `open_dashboard(section='...')` tool to launch the server and open your browser automatically.

---

## Web UI Control Sections

| Section | Route | Capabilities |
|---------|-------|--------------|
| **Profiles** | `/profiles` | Build, customize, and switch agent profiles (`mwijay_noellyne`, `helpful`, `technical`, `creative`). |
| **Sessions** | `/sessions` | View active sessions, inspect execution trajectories, view token usage, and resume past chats. |
| **Models** | `/models` | Configure default model (`minimax-m3`, `gemini-2.5-flash`, etc.), add API keys, configure fallback chains. |
| **Skills** | `/skills` | Browse, filter, edit frontmatter, enable/disable 50+ skills with live preview. |
| **MCP** | `/mcp` | Manage MCP servers (StitchMCP, Firebase, Genkit, GBrain), view connected tools and schemas. |
| **Cron** | `/cron` | Schedule background cron jobs, inspect active timers, set recurring task prompts. |
| **Channels** | `/channels` | Telegram, Discord, Slack integration status, home channel setup, live message routing. |
| **Webhooks** | `/webhooks` | Ingress and egress webhooks for n8n / Zapier / custom automation pipelines. |
| **Logs** | `/logs` | Live real-time log tailing, diagnostic traces, error stack traces, usage analytics. |
| **Pairing** | `/pairing` | Connect mobile devices or remote terminals via secure pairing tokens. |

---

## How to Trigger from Terminal / Chat

- Open main dashboard: `open_dashboard()`
- Open specific page: `open_dashboard(section='models')`, `open_dashboard(section='skills')`, `open_dashboard(section='cron')`
- CLI command: `hermes dashboard` or `python -m hermes_cli.main dashboard`
