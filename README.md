# あなたの学力は何年生？

幼稚園（年少）から大学院博士課程まで、問題に回答しながらアダプティブ（適応型）に学力レベルを判定するWebアプリです。

React + TypeScript + Vite で構築されており、バックエンドは不要です。回答の進捗は localStorage に保存されます。

## セットアップ

```bash
npm install
npm run dev
```

- `/` : スタート画面（「続きから」「最初から」）
- `/quiz` : 診断（アダプティブテスト）
- `/result` : 結果画面
- `/dev/questions` : 開発者向け問題確認画面（問題データの統計・エラー確認）

ビルド:

```bash
npm run build
```

## 問題を追加する方法

このアプリの最大の特徴は、**問題データとアプリのソースコードが完全に分離されている**ことです。
新しい問題を追加するのに、TypeScriptコードを一切書き換える必要はありません。

1. `src/questions/` 以下の好きな場所に JSON ファイルを作成する（サブフォルダを何階層でも作成可能）
2. その JSON の `questions` 配列に問題を書く
3. `npm run dev` または `npm run build` を実行する
4. 自動的に問題として認識される

`loader.ts` へ import 文を追加する、といった手作業は一切不要です。
`src/questions/**/*.json` にマッチするすべてのファイルが Vite の `import.meta.glob` によって再帰的に自動読み込みされます（`src/lib/questions/loader.ts`）。

ファイル名やフォルダ名は読み込みに一切影響しません。学年やレベルは JSON 内部の `level` フィールドで判定されます。1ファイルに1問だけでも、100問まとめて入れても構いません。

### JSONの書き方

```json
{
  "version": 1,
  "questions": [
    {
      "id": "elementary2-math-001",
      "level": "elementary-2",
      "subject": "math",
      "category": "calculation",
      "difficulty": 3,
      "type": "multiple-choice",
      "question": "37 + 48 はいくつですか？",
      "choices": ["75", "85", "95", "105"],
      "answer": "85",
      "explanation": "37 + 48 = 85です。",
      "tags": ["addition", "two-digit"]
    }
  ]
}
```

#### 必須フィールド

| フィールド | 説明 |
| --- | --- |
| `id` | 全問題を通して一意な文字列 |
| `level` | 下記「使用できるlevel一覧」のいずれか |
| `subject` | 科目（`math` / `japanese` / `science` / `social` / `english` / `logic` / `statistics` / `programming` / `research` / `general` など。未知の値も許容） |
| `type` | `multiple-choice` / `multiple-select` / `text` / `numeric` / `true-false` |
| `question` | 問題文 |
| `answer` | 正解（`type` により形式が異なる。下記参照） |
| `choices` | `multiple-choice` / `multiple-select` のみ必須 |

#### 任意フィールド

`explanation`（解説）, `tags`（配列）, `image`（画像URL）, `difficulty`（1〜5の整数。3が標準）, `category`, `latex`（KaTeXで表示する数式ブロック）, `tolerance`（`numeric` のみ、許容誤差）

#### 使用できるlevel一覧

```
kindergarten-young, kindergarten-middle, kindergarten-old,
elementary-1, elementary-2, elementary-3, elementary-4, elementary-5, elementary-6,
junior-high-1, junior-high-2, junior-high-3,
high-school-1, high-school-2, high-school-3,
university-1, university-2, university-3, university-4,
graduate-master-1, graduate-master-2, graduate-doctoral
```

#### 問題形式ごとの `answer` の形式

- `multiple-choice`: `choices` に含まれる文字列を1つ（例: `"85"`）
- `multiple-select`: `choices` の部分集合を配列で（例: `["2", "3", "5"]`。順序は無視されます）
- `text`: 文字列（前後の空白は無視されます）
- `numeric`: 数値（例: `24`。`tolerance` を指定すると許容誤差付きで判定されます）
- `true-false`: `true` または `false`

### バリデーションについて

読み込み時に各問題は自動でバリデーションされます。不正な問題（`id` がない、`level` が不正、`multiple-choice` なのに `choices` がない、など）が1問でもあっても、その問題だけが除外され、アプリ全体はクラッシュしません。開発環境では、どのファイルのどの問題に何の問題があったかが `console.warn` に出力されます。IDが重複している場合も同様に警告され、後から読み込まれた方が除外されます。

`/dev/questions` にアクセスすると、読み込みエラーの一覧や、level別・subject別・ファイル別の問題数を確認できます。

## アダプティブテストの仕組み

- 内部的に `currentAbility` というスコアを持ち、`junior-high-1` 相当から診断を開始します
- 正解・不正解に応じてスコアを上下させます（難易度が高い問題の正解／難易度が低い問題の誤答は変動を大きくします）
- 最初の5問は大きく調整する探索フェーズ、6〜15問は通常フェーズ、16問目以降は調整幅を小さくする最終確認フェーズです
- 出題は現在の推定レベルとその上下1レベルから、直近3問と異なる科目を優先しつつランダムに選ばれます
- 最低15問、最大30問で終了し、その間に推定値が安定していれば終了します

## ディレクトリ構成

```
src/
  components/       UIコンポーネント（quiz / result / common）
  pages/             HomePage, QuizPage, ResultPage, DevQuestionsPage
  questions/         問題データ（JSON。ここに追加するだけでOK）
  lib/
    questions/       読み込み・バリデーション・型定義・レベル定義
    adaptive/         アダプティブテストのエンジン・採点・出題選択
    quiz/             回答判定・localStorage永続化
    results/          結果集計・結果タイトル生成
public/
  question-assets/   問題で使う画像
```
