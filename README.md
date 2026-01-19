# ccwatt

**How much power did your AI use?**

A CLI tool that visualizes the environmental impact of your AI coding assistant usage. Supports Claude Code and OpenCode.

## Quick Start

```bash
npx ccwatt
```

## Supported Tools

| Tool | Data Location |
|------|---------------|
| 🟠 Claude Code | `~/.claude/projects/` |
| 🔷 OpenCode | `~/.local/share/opencode/storage/` |

## Sample Output

```
  🌍 ENVIRONMENTAL IMPACT
  ─────────────────────────────────────────

     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳🌳🌳
     🌳 = 10 trees | 670 tree-days needed


  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
  ┃ ⚡ CARBON STATUS REPORT ⚡             ┃
  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
  ┃ Lv.73 Silicon Sorcerer                  ┃
  ┃ 【A】 Carbon Sorcerer                     ┃
  ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
  ┃ ⚡ PWR   51.35 kWh ██████████ ┃
  ┃ 💨 CO2    25.67 kg ███░░░░░░░ ┃
  ┃ 🌳 TREE   670 days ██████████ ┃
  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

  📁 🟠 Claude Code: 381  🔷 OpenCode: 93
```

## Options

```bash
ccwatt                  # Scan all sources
ccwatt --claude-only    # Claude Code only
ccwatt --opencode-only  # OpenCode only
ccwatt --json           # Output as JSON
ccwatt --quiet          # Show trees only
```

## Calculation Methodology

### Energy per Token

Based on 2024-2025 research on LLM inference energy consumption:

| Model Size | Energy | Examples |
|------------|--------|----------|
| Huge (~175B+) | 0.001 Wh/token | GPT-4, Claude Opus, o1 |
| Large (~70B) | 0.0003 Wh/token | Claude Sonnet, GPT-4o, Gemini Pro |
| Medium (~20B) | 0.0001 Wh/token | Claude Haiku, GPT-3.5, Gemini Flash |
| Small (~7B) | 0.00003 Wh/token | Mistral Small, Llama-8B |

**Research sources:**
- [How Hungry is AI? Benchmarking Energy, Water, and Carbon Footprint of LLM Inference](https://arxiv.org/abs/2505.09598) - Benchmarked 30 LLMs
- [TokenPowerBench: Benchmarking the Power Consumption of LLM Inference](https://arxiv.org/abs/2512.03024) - First token-level power benchmark
- [Epoch AI Analysis](https://epoch.ai/) - Re-evaluated common estimates

Key findings from research:
- GPT-4o query: ~0.34 Wh per query (~0.001 Wh/token for 300-400 tokens)
- Llama3-70B on H100: ~0.39 J/token (~0.0001 Wh/token)
- Modern estimates: 2-3 J/token for typical inference

### Cache Token Handling

```
cache_creation: 100% energy (full computation)
cache_read:       1% energy (memory retrieval only)
```

Prompt caching allows reusing previously computed context. Reading cached tokens requires minimal energy compared to computing new tokens.

### CO2 Conversion

| Factor | Value | Source |
|--------|-------|--------|
| CO2 per kWh | 0.5 kg | Global average grid intensity |
| Tree absorption | 14 kg CO2/year | Average mature tree |
| Tree-day | 38.4 g CO2 | (14 kg / 365 days) |

### Calculation Formula

```
Energy (Wh) = (input + output + reasoning + cache_creation) × energy_per_token
            + cache_read × energy_per_token × 0.01

CO2 (g) = Energy (kWh) × 500

Tree-days = CO2 (g) / 38.4
```

## Rank System

| CO2 | Rank | Title |
|-----|------|-------|
| < 100g | F | Eco Newbie |
| < 500g | E | Carbon Curious |
| < 1kg | D | Watt Watcher |
| < 5kg | C | Power User |
| < 10kg | B | Grid Gremlin |
| < 50kg | A | Carbon Sorcerer |
| < 100kg | S | Climate Chaos Agent |
| < 500kg | S+ | Extinction Accelerator |
| 500kg+ | S++ | Planet Destroyer |

## Disclaimer

These calculations are **estimates** based on publicly available research. Actual energy consumption depends on:

- Specific hardware and data center efficiency
- Geographic location and grid carbon intensity
- Model optimization and quantization
- Batch size and inference configuration

Neither Anthropic nor other AI providers have published official energy consumption figures for their APIs.

## Why?

Not guilt. Awareness.

AI is transformative. But every computation has a cost. When you see the trees, you start to think. When you think, you start to choose.

**[Read more](https://nyanko3141592.github.io/ccwatt/)**

## License

MIT

---

*Built with awareness.*
