# OP Sepolia Proxy Workbench

このワークスペースは、指定アドレス（既定: `0x5CD8f0925513D1Aeb0c762add13f872676a61AD5`）が
EIP-1967系 Proxy かどうかを確認し、`implementation` と `admin` を読むための最小セットです。

## 1) セットアップ

```bash
npm install
```

## 1.5) Hardhat（検証・テスト用）

Hardhat を使うと、次ができます。

- `hh:compile`: Solidity の文法/型チェック
- `hh:test`: テスト実行
- `hh:deploy:*`: デプロイ練習
- `hh:verify`: Etherscan 検証

重要度（初心者向け）:

- 本番デプロイ前にはほぼ必須です。
- 理由は、スマコンはデプロイ後に修正が難しいためです。
- 最低ラインは `compile + test + testnet deploy` です。

Node.js バージョン注意:

- Hardhat は `Node 20 LTS` 推奨です（このリポジトリも `>=20 <23` 想定）。
- `Node 24` だと Windows で `UV_HANDLE_CLOSING` が出る場合があります。

まずはローカルでここまで実行できればOKです。

```bash
npm run hh:compile
npm run hh:test
```

OP Sepolia にデプロイする場合は `.env` を作って値を設定します。

```bash
copy .env.example .env
```

```bash
npm run hh:deploy:opsepolia
```

検証（Verify）は、デプロイ後に表示されたアドレスを使います。

```bash
npm run hh:verify -- <デプロイしたコントラクトアドレス>
```

## 2) 実行

```bash
npm run proxy:read
```

## 3) 手数料追加を試す（Implementation側）

`contracts/ERC20Fv2FeeExample.sol` を追加しています。

- 送金時に `feeBps`（bps = 1/10000）で手数料を差し引く
- 手数料送付先 `feeRecipient` を設定できる
- 除外アドレス（`_feeExempt`）を設定できる
- 上限は `1000 bps`（10%）

手数料計算の確認:

```bash
npm run fee:preview
```

環境変数で金額や料率を変更可能:

```bash
set AMOUNT=1000000000000000000
set FEE_BPS=150
npm run fee:preview
```

重要:

- この `ERC20Fv2FeeExample` は、既存 `ERC20F` ソースがローカルにある前提の差分実装です。
- 既存チェーン上の Implementation を直接書き換えることはできません。
- 実際の反映は「新Implementationをデプロイ → ProxyをupgradeTo」で行います。
- UUPS のアップグレード権限（`_authorizeUpgrade` 相当）がないと更新不可です。

### 3.5) 既存Proxyをアップグレードできるか判定

まずはトランザクションを送らず、`eth_call` で権限判定します。

```bash
set NEW_IMPLEMENTATION=0x新しくデプロイした実装アドレス
set CHECK_FROM=0xあなたのウォレットアドレス
npm run upgrade:check
```

- `PASS` なら、そのアドレスは upgrade 権限を持っている可能性が高いです。
- `FAIL` なら、権限不足またはロジック条件未達です。

実行スクリプト（本番送信）は以下です。

```bash
set NEW_IMPLEMENTATION=0x新しくデプロイした実装アドレス
set PRIVATE_KEY=0x秘密鍵
set EXECUTE_UPGRADE=true
npm run upgrade:exec
```

注意: `upgrade:exec` は実際にオンチェーン送信します。最初は必ず `upgrade:check` から行ってください。

必要なら環境変数を指定できます。

```bash
set RPC_URL=https://sepolia.optimism.io
set TARGET_PROXY=0x5CD8f0925513D1Aeb0c762add13f872676a61AD5
npm run proxy:read
```

## 注意

- デプロイ済み Proxy 自体のコードは変更できません（再デプロイが必要）。
- 本当に「いじる」には次のどちらかです:
  - Proxy の `admin` 権限を持っていて、実装先をアップグレードする
  - 新しい Proxy / 実装を自分でデプロイする
