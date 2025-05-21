# かんばんボードアプリケーション (Kanban Board Application)

## 概要 (Description)
Next.js、TypeScript、Tailwind CSSで構築されたシンプルなかんたんボードアプリケーションです。ユーザーはタスクを作成、管理し、「To Do」「In Progress」「Done」といった異なるカラムで整理することができます。

## 特徴 (Features)
-   **タスク作成 (Create Tasks)**: タイトルとオプションの説明付きで新しいタスクを追加します。
-   **ドラッグ＆ドロップ (Drag & Drop)**: カラム間（「To Do」「In Progress」「Done」）でタスクを簡単に移動したり、カラム内で並べ替えたりできます。
-   **タスク編集 (Edit Tasks)**: 既存タスクのタイトルと説明を変更します。
-   **タスク削除 (Delete Tasks)**: 不要になったタスクを削除します。
-   **ローカルストレージ永続化 (Local Storage Persistence)**: タスクはブラウザのローカルストレージに保存されるため、ボードの状態はセッションを跨いで永続します。
-   **レスポンシブデザイン (Responsive Design)**: アプリケーションはデスクトップからモバイルまで、さまざまな画面サイズで使用できるように設計されています。
-   **スタイル付きインターフェース (Styled Interface)**: Tailwind CSSで構築されたクリーンでモダンなユーザーインターフェース。

## 利用開始方法 (Getting Started)

### 前提条件 (Prerequisites)
システムに以下がインストールされていることを確認してください:
-   [Node.js](https://nodejs.org/) (LTS版推奨)
-   [npm](https://www.npmjs.com/) (Node.jsに付属) または [yarn](https://yarnpkg.com/)

### インストール (Installation)
1.  **リポジトリをクローンする** (該当する場合、またはソースコードをダウンロード):
    ```bash
    # Gitがインストールされている場合
    # git clone <repository-url>
    # cd kanban-board
    ```
    (プロジェクトファイルが既にあると仮定)

2.  **プロジェクトディレクトリに移動する**:
    ```bash
    cd kanban-board
    ```

3.  **依存関係をインストールする**:
    npmを使用する場合:
    ```bash
    npm install
    ```
    yarnを使用する場合:
    ```bash
    yarn install
    ```
    *注意: `react-beautiful-dnd` と React 19 (Next.js 15+で使用) との間に潜在的なピア依存関係の競合があるため、インストール中に問題が発生した場合は `--legacy-peer-deps` フラグを使用する必要があるかもしれません:*
    ```bash
    npm install --legacy-peer-deps
    ```

### 開発サーバーの実行 (Running the Development Server)
1.  開発サーバーを起動する:
    npmを使用する場合:
    ```bash
    npm run dev
    ```
    yarnを使用する場合:
    ```bash
    yarn dev
    ```
2.  ブラウザで [http://localhost:3000](http://localhost:3000) を開いてアプリケーションを確認します。

## 使用技術 (Technologies Used)
-   **フレームワーク (Framework)**: [Next.js](https://nextjs.org/) 15+
-   **言語 (Language)**: [TypeScript](https://www.typescriptlang.org/)
-   **UIライブラリ (UI Library)**: [React](https://reactjs.org/) 19
-   **スタイリング (Styling)**: [Tailwind CSS](https://tailwindcss.com/)
-   **ドラッグ＆ドロップ (Drag & Drop)**: [react-beautiful-dnd](https://github.com/atlassian/react-beautiful-dnd)
-   **リンティング/フォーマット (Linting/Formatting)**: ESLint (Next.jsによる設定)
-   **永続化 (Persistence)**: ブラウザローカルストレージ (Browser Local Storage)

## プロジェクト構成 (Project Structure)
-   `src/app/page.tsx`: かんばんボードのメインアプリケーションコンポーネント。
-   `src/app/globals.css`: グローバルスタイルとTailwind CSSのセットアップ。
-   `public/`: 静的アセット。
-   `jest.config.js`, `jest.setup.js`: Jestテスト設定（セットアップ試行中に環境問題に直面）。
-   `__mocks__/`: Jestモック用ディレクトリ。
