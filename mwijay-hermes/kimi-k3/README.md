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
| Checkpoint kwenye disk | **1.56 TB** (96 shards, byte 1,560,936,091,448) |
| Jumla ya nafasi inayohitajika | **~1.7 TB** (1.56 TB checkpoint + 109 GB packed trunk) |
| RAM ya chini | GB 8 na kuendelea (8.24 GB peak kwenye laptop) |
| Engine yenyewe | 176 KB |
| GPU | 0 — CPU tu (AVX2+FMA kwenye x86-64, NEON kwenye arm64) |
| Kasi (laptop 8GB) | ~26.5 s/token |
| Kasi (mashine kubwa 128GB+) | ~5.3–5.6 s/token |
| Mifumo inayofanya kazi | Linux (reference), macOS/arm64, **Windows/x86-64** (MSYS2 MinGW-w64) |

## Kwa nini sio kwa PC ya Mwijay (kwa sasa)

- PC ya Mwijay: Windows, 8–16 GB RAM, **disk < 1 TB** → inahitaji **~1.7 TB**, **haingii**.
- Hata kama ingeingia, ni **polepole sana** kwa agent wa kila siku.
- Ni **CLI**, sio API — Hermes haiwezi kuizungumza moja kwa moja.

## Jinsi ya kujaribu (kwa siku nyingine, ukiwa na disk kubwa)

```bash
# 0. Jaribu bila kupakua chochote (chini ya dakika moja, hakuna model wala mtandao)
git clone https://github.com/FareedKhan-dev/kimi-k3-in-c.git
cd kimi-k3-in-c
make -j
make test          # lazima iishe na: ALL WEIGHTLESS TESTS PASSED

# 1. Angalia kama PC yako inaweza (inapima RAM, disk, toolchain)
./scripts/k3-doctor.sh

# 2. Pakua model — 1.56 TB kamili (inahitaji ~1.7 TB nafasi wazi)
export HF_TOKEN=hf_your_token_here
./scripts/download-model.sh ~/k3model        # resumable, rudia kuendelea

#    ...au pakua SEHEMU tu kwa diski ndogo (MAJARIBIO — sio Kimi K3 kamili):
./scripts/download-model.sh ~/k3model --layers 2

# 3. Pack trunk (109 GB)
./scripts/pack-trunk.sh ~/k3model ~/k3trunk

# 4. Endesha
./bin/k3 ~/k3model --trunk ~/k3trunk --preset laptop --tok ~/k3model \
  --prompt "The capital of France is" --gen 8 --incremental
```

> Kwenye **Windows**: build inafanya kazi kupitia **MSYS2 / MinGW-w64** (Git Bash inatosha
> kwa `make test`). Tumia `.gitattributes` ya repo — inalazimisha LF kwenye scripts ili
> zisishindwe na CRLF za Windows.

> ⚠️ `--layers N` inatoa toleo dogo la majaribio — matokeo yake **sio** Kimi K3 kamili.
> Kwa kazi halisi, tumia **Groq / Gemini / OpenRouter** kwenye Hermes.

## Bridge ya majaribio (K3 → Hermes)

Faili `kimi_bridge.py` hapa ni mfano wa bridge inayofanya Kimi K3 local
ionekane kama **OpenAI-compatible API** (`http://127.0.0.1:8080/v1`), ili Hermes
ingeweza kuitumia kama `provider: custom` — **kama tu** una disk 2 TB+ na subira ya sekunde 5–26/token.

Hii ni kwa kujifunza tu. Kwa matumizi ya kila siku: **cloud APIs**.
