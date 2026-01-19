# Watt Did AI Cost?

**How much power did your AI use?**

A CLI tool that visualizes the environmental impact of your Claude Code usage. See your token consumption translated into energy, CO2, and trees.

## Quick Start

```bash
npx watt-did-ai-cost
```

That's it. No setup required.

## What It Does

Scans your local Claude Code session data (`~/.claude/projects/`) and calculates:

- **Energy consumption** (Wh/kWh)
- **CO2 emissions** (grams/kg)
- **Tree-days** needed to absorb the CO2

All data stays on your machine. Nothing is sent anywhere.

## Sample Output

```
  ╭─────────────────────────────────────╮
  │    ⚡ Watt Did AI Cost? ⚡          │
  │    How much power did your AI use? │
  ╰─────────────────────────────────────╯

  🌳 Trees needed to absorb this CO2
  ─────────────────────────────────────
     🌳🌳🌳🌳🌳🌳🌳🌳🌳🌳
     🌳🌳🌳🌳🌳
     (15 tree-days of absorption)

  📊 Token Usage
  ─────────────────────────────────────
     Input: 1.2M  Output: 800K  Cache: 5M
     Total: 7M tokens

  ⚡ Energy & CO2
  ─────────────────────────────────────
     Power: 7.0 kWh
     CO2:   3.5 kg

  🎯 With this much power you could...
  ─────────────────────────────────────
     ☕ brew 70 cups of coffee
     📱 do 700 phone charges
     🎮 play 35 hours of PS5
```

## Options

```bash
watt --json     # Output as JSON
watt --quiet    # Show trees only (great for prompt integration)
```

## Calculation Basis

| Model | Estimated Energy |
|-------|-----------------|
| Opus | ~0.003 Wh/token |
| Sonnet | ~0.001 Wh/token |
| Haiku | ~0.0003 Wh/token |

- CO2 factor: 0.5 kg-CO2/kWh (global average)
- Tree absorption: 14 kg CO2/year per tree

*These are estimates based on research. Anthropic has not published official figures.*

## Why?

Not guilt. Awareness.

AI is transformative. But every computation has a cost. When you see the trees, you start to think. When you think, you start to choose.

**[Read more](https://nyanko3141592.github.io/watt-did-ai-cost/)**

## License

MIT

---

*Built with awareness.*
