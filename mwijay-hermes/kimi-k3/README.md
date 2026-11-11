# Kimi K3 in C — Maelezo kwa Mwijay

Repo halisi: https://github.com/FareedKhan-dev/kimi-k3-in-c

## Maana kwa Swahili rahisi

Fikiria **Kimi K3** ni injini ya ndege kubwa sana (2.78 trillion parts).
Kawaida injini hiyo inahitaji kiwanda kizima (server kubwa + GPU nyingi) ili kufanya kazi.

Repo hii imeandika injini hiyo **kwa lugha ya C** — lugha ya chini kabisa,
kama kuandika injini kwa mikono bila sehemu za ziada (bila Python, bila GPU, bila framework).

**Ujanja wake:** Injini haingizi sehemu zote RAM-ini mara moja.
Kwa kila swali, inatumia sehemu **16 tu kati ya 896** (experts), na inazisoma
kutoka disk moja kwa moja. Ndiyo maana inafanya kazi na RAM ya **8 GB** tu,
ingawa injini yenyewe ni **1.56 TB** kwenye disk.

## Namba muhimu

| Jambo | Namba |
|---|---|
| Parameters | 2.78 trillion |
| Checkpoint kwenye disk | **1.56 TB** (96 shards) |
| RAM ya chini | 8.24 GB (peak) |
| Engine yenyewe | 176 KB |
| GPU | 0 — CPU tu |
| Kasi (laptop 8GB) | ~26.5 s/token |
| Kasi (workstation 128GB+) | ~5.6 s/token |

## Kwa nini sio kwa PC ya Mwijay (kwa sasa)

- PC ya Mwijay: Windows, 8–16 GB RAM, **disk < 1 TB** → 1.56 TB **haingii**.
- Hata kama ingeingia, ni **polepole sana** kwa agent wa kila siku.
- Ni **CLI**, sio API — Hermes haiwezi kuizungumza moja kwa moja.

## Jinsi ya kujaribu (kwa siku nyingine, ukiwa na disk kubwa)

```bash
# 1. Clone na build (engine ni ndogo, inajengwa haraka)
git clone https://github.com/FareedKhan-dev/kimi-k3-in-c.git
cd kimi-k3-in-c
make            # au: cmake -B build && cmake --build build

# 2. Pakua model (inahitaji 1.56 TB — TUMIA --layers N kwa majaribio kwenye disk ndogo)
./scripts/download-model.sh ~/k3model --layers 2   # majaribio tu, sio Kimi K3 kamili

# 3. Endesha
./bin/k3 ~/k3model --trunk ~/k3trunk --preset laptop --tok ~/k3model \
  --prompt "The capital of France is" --gen 8 --incremental
```

> ⚠️ `--layers N` inatoa toleo dogo la majaribio — matokeo yake **sio** Kimi K3 kamili.
> Kwa kazi halisi, tumia **Groq / Gemini / OpenRouter** kwenye Hermes.

## Bridge ya majaribio (K3 → Hermes)

Faili `kimi_bridge.py` hapa ni mfano wa bridge inayofanya Kimi K3 local
ionekane kama **OpenAI-compatible API** (`http://127.0.0.1:8080/v1`), ili Hermes
ingeweza kuitumia kama `provider: custom` — **kama tu** una disk 2 TB+ na subira ya sekunde 5–26/token.

Hii ni kwa kujifunza tu. Kwa matumizi ya kila siku: **cloud APIs**.
