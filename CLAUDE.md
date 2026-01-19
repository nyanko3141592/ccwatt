# watt-did-ai-cost

Claude Code の電力消費を可視化するCLIツール

## 使い方

```bash
npx watt-did-ai-cost   # または npm run dev
watt                    # インストール後
watt --json             # JSON出力
watt --quiet            # 木だけ表示
```

## 技術スタック

- TypeScript + Node.js
- tsup (バンドル)
- chalk, ora, cli-table3 (表示)

## 構成

```
src/
├── index.ts           # CLI エントリポイント
└── lib/
    ├── calculator.ts  # 電力・CO2計算
    ├── scanner.ts     # ~/.claude/ スキャナー
    └── display.ts     # ターミナル表示
```

## コマンド

```bash
npm run dev    # 開発実行
npm run build  # ビルド
```
