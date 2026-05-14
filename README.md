# TaskManagement — Trello風カンバンアプリ

RaiseTech の課題として作成している、カンバン形式のタスク管理 Web アプリです。  
カードをカラム間でドラッグ&ドロップすることで、タスクの進捗を視覚的に管理できます。

---

## 技術スタック

| レイヤー | 技術 | バージョン |
|----------|------|------------|
| フロントエンド | React + TypeScript + Vite | React 19.2.6 / TS 6.0.2 / Vite 8.0.12 |
| バックエンド | Java + Spring Boot | Java 21 (LTS) / Spring Boot 3.4.5 |
| ビルドツール | Gradle | 8.14.5 |
| ORM | Spring Data JPA + Hibernate | Spring Boot 付属 |
| API 仕様書 | SpringDoc OpenAPI (Swagger) | 2.8.8 |
| データベース | PostgreSQL | 17 (Docker) |
| バージョン管理 | Git / GitHub | — |

---

## ディレクトリ構成

```
TaskManagement/
├── backend/          # Spring Boot アプリケーション（ポート 8080）
├── frontend/         # Vite + React + TypeScript（ポート 5173）
├── docs/             # 各種設計・要件ドキュメント
├── prototype/        # HTML/CSS/JS プロトタイプ
├── docker-compose.yml
└── CLAUDE.md
```

---

## 起動手順

### 前提条件

- Java 21 以上
- Docker Desktop
- Node.js 20 以上

### 1. データベースを起動（PostgreSQL）

```powershell
docker-compose up -d
```

### 2. バックエンドを起動（ポート 8080）

```powershell
cd backend
.\gradlew bootRun
```

起動後、Swagger UI で API 仕様を確認できます：  
http://localhost:8080/swagger-ui.html

### 3. フロントエンドを起動（別ターミナル、ポート 5173）

```powershell
cd frontend
npm install
npm run dev
```

ブラウザで http://localhost:5173 を開くとアプリが表示されます。

---

## 主な機能

### Phase 1（実装予定）

| # | 機能 | 説明 |
|---|------|------|
| F-01 | カード追加 | カラム内にテキスト入力でタスクカードを追加 |
| F-02 | カード削除 | 不要なカードを削除 |
| F-03 | カラム追加 | 任意の名前でカラムを追加 |
| F-04 | カラム削除 | カラムとその中のカードをまとめて削除 |
| F-05 | カードの移動 | ドラッグ&ドロップでカラム間を移動 |
| F-06 | データ保存 | PostgreSQL に永続化（リロードしてもデータが消えない） |

### Phase 2（Phase 1 完成後）

- F-07：期限設定（期限切れは色で警告）
- F-08：説明文（カード詳細モーダル）
- F-09：カラム内でのカード並び替え

### Phase 3（Phase 2 完成後）

- F-10：チェックリスト
- F-11：色ラベル

---

## API エンドポイント（概要）

| メソッド | エンドポイント | 処理 |
|----------|----------------|------|
| GET | `/api/columns` | カラム一覧（カード含む）を取得 |
| POST | `/api/columns` | カラムを新規作成 |
| PATCH | `/api/columns/:id` | カラム名・順番を更新 |
| DELETE | `/api/columns/:id` | カラムを削除（カードも削除） |
| POST | `/api/cards` | カードを新規作成 |
| PATCH | `/api/cards/:id` | カードの内容・所属カラム・順番を更新 |
| DELETE | `/api/cards/:id` | カードを削除 |

詳細は [docs/database-design.md](docs/database-design.md) を参照してください。

---

## ドキュメント一覧

| ドキュメント | 内容 |
|--------------|------|
| [docs/requirements.md](docs/requirements.md) | 要件定義書（目的・機能一覧・ユースケース） |
| [docs/functional-requirements.md](docs/functional-requirements.md) | 機能要件定義書 |
| [docs/tech-stack.md](docs/tech-stack.md) | 技術スタック詳細・選定理由 |
| [docs/design.md](docs/design.md) | システム設計書（ER図・APIエンドポイント） |
| [docs/database-design.md](docs/database-design.md) | データベース設計書（テーブル定義） |
| [docs/screen-design.md](docs/screen-design.md) | 画面設計書（ワイヤーフレーム） |
