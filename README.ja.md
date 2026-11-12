<div align="center">

<img src=".claude-plugin/icon.png" width="112" alt="Clawd">

# clawd

**Claude Code のマスコット Clawd がプロンプトの上に住み、Claude の作業を演じてくれます。**

[![CI](https://github.com/wray-lee/clawd/actions/workflows/ci.yml/badge.svg)](https://github.com/wray-lee/clawd/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/wray-lee/clawd)](https://github.com/wray-lee/clawd/releases)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-2.1.319%2B-D97757)](https://claude.com/claude-code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[English](README.md) | [简体中文](README.zh-CN.md) | 日本語

<img src="docs/assets/demo.gif" alt="Clawd がコマンドを実行し、4 つのサブエージェントに 4 匹の小さな Clawd が現れ、終わったものから順に去っていく" width="100%">

</div>

## 特長

- **作業を演じる**：Claude が考えている間は歩き回り、シェルコマンドではタイピング、読み込み中は目をきょろきょろ、検索中は虫めがねをかざし、編集中はハンマーを振り、skill では魔法をかけ、MCP 呼び出しでは頭のアンテナから電波を出します。
- **サブエージェントごとに小さな Clawd**：実行中のサブエージェント（workflow のエージェントも含む）それぞれに、自分の色の小さな Clawd が付きます。サブエージェントがさらに起動したサブエージェントは、もっと小さくなります。workflow のエージェントは紫のシルクハットをかぶります。エージェントが終わると去っていきます。
- **あなたに反応する**：プロンプトに入力すると一緒にタイピングし、最後に押したキーを掲げます。クリックすると、そのときの状態に合わせて反応します。クリックで Clawd の文字が選択されることはないので、反転表示もコピーもされません。
- **気分がある**：ターンが終わるとお祝いし、ツールが失敗すると驚き、静かな時間が 2 分ほど続くと眠ります。
- **カラフル**：Clawd はウェルカム画面と同じテーマのオレンジのまま。小さな Clawd は 12 色、紙吹雪、きらきら、`z`、電波、煙にもそれぞれ色があります。すべての文字が 1 カラム幅なので、CJK 端末でもずれません。

## インストール

Claude Code のターミナルセッションのプロンプトで：

```
/plugin install clawd --marketplace wray-lee/clawd
```

`y` でマーケットプレイスを追加し、スコープを選びます（user スコープならすべてのセッションで読み込まれます）。シェルからは：

```sh
claude plugin install clawd --marketplace wray-lee/clawd
```

インストール後、Claude Code を再起動してください。`/clawd` でバンドの表示と非表示を切り替えます。

## Clawd のしぐさ

<img src="docs/assets/actions.gif" alt="Clawd が歩く、タイピング、読み込み、検索、編集、魔法、MCP の電波、一緒にタイピング、お祝い、失敗、昼寝を順に演じる" width="560">

| とき | Clawd |
| --- | --- |
| Claude が考えている | 行ったり来たり歩く |
| シェルコマンドの実行中 | タイピング、頭上に `>_` |
| ファイルやページの読み込み中 | 目をきょろきょろ、頭上に `...` |
| 検索中（Grep、Glob、Web 検索） | 虫めがねを左右にかざす、頭上に `?` |
| ファイルの編集中 | ハンマーを振り、火花が飛ぶ |
| skill の使用中 | 両手を上げ、2 つの火花が頭のまわりを回る |
| MCP ツールの呼び出し中 | 頭のアンテナから `( ( \| ) )` |
| ターンが終わった | にっこり目でジャンプ、紙吹雪が舞う |
| ツールが失敗した | `!` とぶるっと震える |
| 何もないとき | まばたき、よそ見、ジャンプ |
| 約 2 分たった | `z Z` で眠る、入力すると起きる |
| プロンプトに入力中 | 一緒にタイピング、最後のキーを掲げる |

ツールのしぐさは最低 1.5 秒続くので、すぐ終わる検索や skill も一瞬で消えずに見えます。

<img src="docs/assets/actions.png" alt="しぐさごとに 1 コマ、説明付き" width="100%">

### サブエージェントの小さな Clawd

<img src="docs/assets/workflow.gif" alt="普通のサブエージェントの小さな Clawd と、紫のシルクハットをかぶった workflow のエージェント 3 匹が跳ね、終わったものから去っていく" width="100%">

<img src="docs/assets/helpers.png" alt="Clawd の横に色違いの小さな Clawd が 4 匹と、入れ子のサブエージェントを表すさらに小さな 1 匹" width="100%">

- サブエージェントには 5 カラム幅の小さな Clawd、その子サブエージェントには 3 カラム幅のさらに小さな Clawd が付きます。3 階層目より深いものは 1 ピクセルの点になります。入れ子のものは親のすぐ後ろに並びます。
- 色は 12 色のパレット（`hooks/palette.ts`）からランダムに選ばれます。xterm-256 色なので、256 色端末でも同じ色にまとまりません。12 色を使い切るまで、画面上で色がかぶることはありません。
- workflow が起動したエージェントは、`ultracode` ラベルと同じ紫のシルクハットをかぶるので、普通のサブエージェントと見分けられます。体がこの紫になることはありません。
- 小さな Clawd は Clawd の広い側に並びます。通常サイズと小サイズは最大 8 匹まで描かれます。1 ピクセルの点はこの数に含まれず、場所があればすべて描かれます。残りは `[-]` の下に細い 2 列で数えられます。普通のサブエージェントが先、workflow のエージェントが後で、`+N`（workflow はシルクハットの紫）の下にそれぞれの色の点が並びます。小さな Clawd は Clawd のエフェクトを避けるので、ハンマーや紙吹雪が隠れることはありません。

<img src="docs/assets/crowd.png" alt="Clawd の横に小さな Clawd が 8 匹。[-] の下にサブエージェントの +4 の列と色付きの点、紫の workflow エージェントの +2 の列" width="100%">
- エンジンがエージェントを完了、失敗、または停止と報告すると去ります。バックグラウンドの作業を待っているサブエージェントの Clawd は残ります。

### Clawd をクリック

| Clawd が | クリックすると |
| --- | --- |
| 待機中 | にっこり目でくすくす笑い、きらきら |
| 眠っている | `!` で目を覚ます |
| 歩いている | くるっと回って目を回す |
| コマンド実行中 | 手で追い払う、`!?` |
| 読み込み中 | 顔を上げてあなたを見る、`o.o` |
| 編集中 | ハンマーで自分の頭をこつん |
| お祝い中 | ハイタッチ |
| 検索中 | 見つけた！虫めがねを高く掲げて `!` |
| skill の使用中 | 魔法がぽんっと失敗して煙が出る |
| MCP 呼び出し中 | 回線がバチバチする |

> [!NOTE]
> クリックには、端末がマウスを報告するフルスクリーンレイアウトが必要です。tmux では `CLAUDE_CODE_NO_FLICKER=1` を設定してください。バンドは専用の領域に描かれるので、押しても文字の選択は始まりません。

<img src="docs/assets/celebrate.png" alt="ターンが終わり、にっこり目で跳ねてお祝いする Clawd" width="100%">

## 必要なもの

- Claude Code 2.1.319 以降、ターミナルで。バンドを描くのはターミナルだけで、デスクトップ版とモバイルアプリには表示されません。
- プロンプトの上に 4 行の空き。足りないときは Clawd は隠れます。

## よくある質問

<details>
<summary>Clawd をトランスクリプトの背後の本物の背景にできますか？</summary>

できません。ターミナルの mod は自分のバンドの中にしか描けず、バンドの外に置いたものは切り取られます。バンドの横の `[-]` はエンジンが描くもので、プラグインからは消せません。
</details>

<details>
<summary>アップデートを入れたのに変わりません。</summary>

Claude Code を再起動してください。インストール済みのプラグインは起動時に読み込まれ、`/reload-plugins` では新しいバージョンに切り替わりません。
</details>

<details>
<summary>Clawd の動きを止めるには？</summary>

`/clawd` を実行します。隠れている間は何も描かず、再描画もしません。
</details>

## 開発

```sh
git clone https://github.com/wray-lee/clawd
cd clawd
claude --plugin-dir .      # 手元のコードで Claude Code を起動
claude plugin validate .
claude plugin test .
```

構成としぐさの追加方法は [CONTRIBUTING.md](CONTRIBUTING.md) を参照してください。

## 似たプロジェクト

- [zhanbodev/clawd-buddy](https://github.com/zhanbodev/clawd-buddy)
- [CodeChrisB/MyClawd](https://github.com/CodeChrisB/MyClawd)

## ライセンス

[MIT](LICENSE)。Clawd は Anthropic のマスコットです。本プロジェクトはファン作品であり、Anthropic の公式製品ではありません。
