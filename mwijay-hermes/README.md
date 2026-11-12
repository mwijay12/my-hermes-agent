# 🤖 Hermes Agent wa Mwijay — Customized kwa Jina Lako

> **Mwijay AI** — Hermes Agent yako binafsi, iliyobinafsishwa kwa jina lako (Mwijay),
> skills za **All-Rounder** (Coding + Biashara + Research + Automation),
> na Cloud APIs: **Groq, Gemini, OpenRouter na zaidi** — kwa PC ya Windows.

> 📖 **Hupendi kusoma faili za `.md`?** Fungua **`easy-guide.html`** — ni mwongozo ule ule
> kwa Kiswahili rahisi, umeundwa kama ukurasa wa kitabu (hakuna alama za markdown).

---

## 1. Maana ya `kimi-k3-in-c` (uliyouliza)

Repo: https://github.com/FareedKhan-dev/kimi-k3-in-c

| Jambo | Maana yake |
|---|---|
| **Kimi K3** | Model kubwa ya AI kutoka Moonshot AI (China). Ina **2.78 trillion parameters** (MoE — Mixture of Experts). |
| **`in-c`** | Imeandikwa upya kwa lugha ya **C99** — bila Python, bila framework, bila GPU, bila BLAS. Engine nzima ni **176 KB** tu. |
| **Inaendeshwa vipi kwenye PC ndogo?** | Hainaingiza model yote RAM-ini. Inasoma **experts (sehemu za model) kutoka disk moja kwa moja** kila token, kwa sababu kwa kila token inatumia **16 tu kati ya 896 experts**. Ndiyo maana inafanya kazi na RAM ya 8 GB. |
| **Inahitaji disk ngapi?** | **1.56 TB** kwa checkpoint kamili (96 shards) + 109 GB trunk = **~1.7 TB**. Hii ndiyo sababu ulivyosema *"inataka karibu 2TB???"* — **ndiyo, ni kweli.** |
| **Ni polepole kiasi gani?** | Laptop ya 8 GB: **~26.5 sekunde/token**. Desktop 64 GB: **~19.8 s/token**. Workstation 128 GB+: **~5.3–5.6 s/token**. Token ≈ neno fupi, kwa hiyo jibu la sentensi 20 linaweza kuchukua dakika 2–9. |
| **Inaweza kujaribiwa bila model?** | Ndiyo! `make -j && make test` — chini ya dakika moja, hakuna download. |
| **Na diski ndogo?** | Kuna `--layers N` inayopakua baadhi tu ya shards (majario, sio Kimi K3 kamili). |
| **Inafaa kwa nini?** | Research, kujifunza jinsi LLM kubwa zinavyofanya kazi, kuendesha model kubwa bila GPU. **Sio kwa kazi za kila siku.** |

### Kwa nini hatutumii Kimi K3 kila siku kwenye PC yako?

1. PC yako: **Windows, RAM 8–16 GB, disk < 1 TB** → inahitaji **~1.7 TB**, **haingii kabisa**.
2. Hata kama ingeingia, majibu yangekuwa **polepole sana** kwa agent anayefanya kazi nyingi (coding, research, automation).
3. Kimi K3 in C ni **CLI binary** (`./bin/k3 --prompt "..."`), sio API — Hermes haiwezi kuizungumza moja kwa moja bila bridge (tumekuwekea bridge ya majaribio kwenye `kimi-k3/kimi_bridge.py`).

**Hitimisho:** Kimi K3 = funzo la kuvutia kwa siku nyingine ukiwa na disk 2 TB+.
Hermes ya kila siku = **Cloud API** (haraka, nafuu/bure, hakuna download ya TB).

Angalia: [`kimi-k3/README.md`](kimi-k3/README.md) kwa maelezo zaidi na jinsi ya kujaribu toleo dogo (`--layers N`).

---

## 2. Hermes Agent ni nini?

Hermes Agent (Nous Research) ni **agent wa AI anayejifunza mwenyewe**:

- **Skills** — anajitengenezea skills kutoka uzoefu, na kuziboresha.
- **Memory** — anakumbuka mazungumzo ya zamani na kukujua wewe (USER.md / MEMORY.md).
- **Tools** — terminal, browser, files, web search, cron (ratiba), subagents.
- **Gateway** — unaweza kuizungumza kutoka **Telegram, Discord, WhatsApp, Slack** — sio terminal tu.
- **Model yoyote** — hubadilisha model kwa `hermes model` bila kubadilisha code. Hapo ndipo Groq/Gemini zinapoingia.

Kubinafsisha Hermes **sio** kubadilisha uzito wa model. Ni:
`jina + personality (SOUL.md) + kumbukumbu (USER.md/MEMORY.md) + skills + config (model/provider)`.

Hiyo ndiyo tumefanya hapa kwa **Mwijay**.

---

## 3. Muundo wa folda hii

```
mwijay-hermes/
├── README.md                  ← Mwongozo huu (Swahili)
├── easy-guide.html            ← Mwongozo rahisi wa kusoma (hakuna markdown) ← ANZIA HAPA
├── profile/
│   ├── SOUL.md                ← Personality: Mwijay AI anavyozungumza
│   ├── USER.md                ← Kumbukumbu: Mwijay ni nani, anapenda nini
│   └── MEMORY.md              ← Kumbukumbu ya muda mrefu ya agent
├── config/
│   ├── config.yaml            ← Config ya Groq/Gemini/OpenRouter + personalities
│   └── .env.example           ← Wapi pa kupata API keys (USIWEKE keys halisi hapa)
├── scripts/
│   ├── install-windows.ps1    ← Install kwenye Windows (PowerShell)
│   └── install-linux.sh       ← Install kwenye Linux/WSL2
└── kimi-k3/
    ├── README.md              ← Maelezo kamili ya Kimi K3 in C
    └── kimi_bridge.py         ← Bridge ya majaribio: K3 → OpenAI-compatible API
```

> 🧩 **Skills za Mwijay AI zimehamishwa** kwenda `skills/mwijay-ai/` kwenye mzizi wa repo,
> ili Hermes izigundue moja kwa moja (na `/skills` izionyeshe):
> `skills/mwijay-ai/` → `mwijay-allrounder`, `swahili-english`, `coding-assistant`,
> `business-content`, `research-learning`.

---

## 4. Jinsi ya kuinstall kwenye PC yako (Windows)

### Hatua 1 — Install Hermes

Fungua **PowerShell** (kama Administrator si lazima) na uendeshe:

```powershell
iex (irm https://hermes-agent.nousresearch.com/install.ps1)
```

Au tumia script yetu:

```powershell
powershell -ExecutionPolicy Bypass -File .\mwijay-hermes\scripts\install-windows.ps1
```

Installer inashughulikia: Python 3.11, Node.js, ripgrep, ffmpeg, Git Bash, na `uv`.

### Hatua 2 — Weka API Keys (Groq + Gemini)

Pata keys **bure**:

| Provider | Wapi kupata key | Faida |
|---|---|---|
| **Gemini** (Google AI Studio) | https://aistudio.google.com/apikey | Free tier kubwa, model zenye uwezo mkubwa, inafaa Swahili |
| **Groq** | https://console.groq.com/keys | Haraka sana (LPU), free tier, inafaa coding |
| **OpenRouter** | https://openrouter.ai/keys | Models 300+, free models pia, kubadilisha model kwa urahisi |
| **Nous Portal** | https://portal.nousresearch.com | Subscription moja: models + search + image + TTS |

Kisha fungua `.env` ya Hermes (`%LOCALAPPDATA%\hermes\.env` kwenye Windows, au `~/.hermes/.env` kwenye Linux) na uweke:

```env
GEMINI_API_KEY=key_yako_hapa
GROQ_API_KEY=key_yako_hapa
OPENROUTER_API_KEY=key_yako_hapa
```

> ⚠️ **USIWEKE API keys kwenye GitHub.** Keys zinakaa kwenye `.env` ya PC yako tu. Faili ya `config/.env.example` hapa ni mfano tu.

### Hatua 3 — Nakili profile na config ya Mwijay

```powershell
# Windows PowerShell
Copy-Item .\mwijay-hermes\profile\SOUL.md   "$env:LOCALAPPDATA\hermes\SOUL.md" -Force
Copy-Item .\mwijay-hermes\profile\USER.md   "$env:LOCALAPPDATA\hermes\USER.md" -Force
Copy-Item .\mwijay-hermes\profile\MEMORY.md "$env:LOCALAPPDATA\hermes\MEMORY.md" -Force
Copy-Item .\mwijay-hermes\config\config.yaml "$env:LOCALAPPDATA\hermes\config.yaml" -Force

# Skills za Mwijay
New-Item -ItemType Directory -Force "$env:LOCALAPPDATA\hermes\skills" | Out-Null
Copy-Item .\skills\mwijay-ai\* "$env:LOCALAPPDATA\hermes\skills\" -Recurse -Force
```

Kwenye **Linux/WSL2**:

```bash
cp mwijay-hermes/profile/SOUL.md mwijay-hermes/profile/USER.md mwijay-hermes/profile/MEMORY.md ~/.hermes/
cp mwijay-hermes/config/config.yaml ~/.hermes/config.yaml
mkdir -p ~/.hermes/skills && cp -r skills/mwijay-ai/* ~/.hermes/skills/
```

### Hatua 4 — Anza kuzungumza

```bash
hermes            # Terminal UI — anza chat
hermes model      # Chagua model (Gemini / Groq / OpenRouter)
hermes doctor     # Angalia kama kila kitu kiko sawa
```

Majaribio ya haraka:

```
/personality mwijay          # Weka personality ya Mwijay AI
/skills                      # Angalia skills zako
/model gemini                # Badili model
```

---

## 5. Kubadilisha Model (Groq ↔ Gemini ↔ OpenRouter)

```bash
hermes model        # Chagua kwa njia ya UI
# au moja kwa moja:
hermes --provider gemini --model gemini-2.5-flash "..."
hermes --provider openrouter --model openai/gpt-4o-mini "..."
```

Groq inatumika kama **custom OpenAI-compatible endpoint**:

```yaml
# config.yaml
model:
  provider: custom
  base_url: "https://api.groq.com/openai/v1"
  default: "llama-3.3-70b-versatile"   # au model nyingine ya Groq
```

Angalia `config/config.yaml` kwa mfano kamili ulioandaliwa kwa Mwijay.

---

## 6. Cool Stuffs ulizouliza

| Feature | Jinsi ya kuipata |
|---|---|
| **Telegram / WhatsApp / Discord** | `hermes gateway setup` kisha `hermes gateway start` — unazungumza na Mwijay AI kutoka simu |
| **Ratiba (Cron)** | `/cron` — mf. "kila siku saa 7 asubuhi nitumie ripoti ya habari" |
| **Voice** | Voice memo transcription + TTS (Groq Whisper bure) |
| **Subagents** | Agent anagawanya kazi na kufanya kazi sambamba |
| **Skills mpya** | Mwambie: *"Jifunze skill ya X"* — Hermes inajitengenezea yenyewe |
| **Kumbukumbu** | `MEMORY.md` + `USER.md` — anakumbuka unachomwambia |
| **Kimi K3 (majaribio)** | Angalia `kimi-k3/` — bridge + `--layers N` kwa disk ndogo |

---

## 7. Maswali ya Mara kwa Mara

**Q: Kimi K3 haiwezi kutumika kabisa kwenye PC yangu?**
A: Toleo kamili (1.56 TB) — hapana. Toleo dogo la majaribio (`--layers 2` au `--layers 5`) — ndiyo, lakini matokeo yake sio Kimi K3 kamili na ni polepole. Kwa kazi halisi tumia Groq/Gemini.

**Q: Groq na Gemini ni bure?**
A: Wote wana free tier. Gemini (AI Studio) free tier ni kubwa. Groq free tier ni nzuri kwa matumizi ya kawaida. OpenRouter pia ina free models.

**Q: Jina la agent ni Mwijay?**
A: Ndiyo — personality ya `mwijay` kwenye config na SOUL.md inaitwa **Mwijay AI**. Unaweza kubadilisha jina lolote kwenye `profile/SOUL.md` na `profile/USER.md`.

**Q: Naweza kuongeza skills zangu mwenyewe?**
A: Ndiyo — nakili folda yoyote kutoka `skills/` kwenda `~/.hermes/skills/` (au `%LOCALAPPDATA%\hermes\skills\` kwenye Windows), kila skill ni folda yenye `SKILL.md`.

---

*Imetengenezwa kwa Mwijay — All-Rounder Hermes Agent. Karibu kwenye timu, Mwijay AI! 🚀*
