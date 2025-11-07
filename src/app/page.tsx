"use client";
import { useState } from "react";

type EvaluationResult = {
  scores: Record<string, number>;
  total: number;
  comment: string;
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEvaluate = async () => {
    if (!url) return alert("URLを入力してください");
    setLoading(true);
    setResult(null);

    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  return (
    <main className="bg-white-200 min-h-screen p-10">
      <h1 className="text-2xl font-bold mb-6 text-center">表現の正当性チェックAI</h1>

      <input
        type="text"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="w-full border rounded-md p-2"
      />

      {/* 👇 大きくて押しやすいボタン */}
      <div className="flex justify-center mt-6">
        <button
          onClick={handleEvaluate}
          disabled={loading}
          className="
            bg-blue-600
            text-white
            text-2xl
            font-semibold
            px-12 py-4
            rounded-2xl
            hover:bg-blue-700
            disabled:bg-gray-400
            disabled:cursor-not-allowed
            transition-all duration-300
            shadow-lg hover:shadow-xl
            transform hover:scale-105
          "
        >
          {loading ? "分析中..." : "採点する"}
        </button>
      </div>

      {/* 👇 resultがあるときだけ描画 */}
      {result && (
        <div className="mt-6 text-left border rounded-md p-4 bg-white shadow">
          <h2 className="text-xl font-semibold mb-3">評価結果</h2>
          <p className="mb-2 font-bold">総合スコア: {result.total}点</p>

          <ul className="list-disc ml-5 mb-4">
            {Object.entries(result.scores).map(([key, value]) => (
              <li key={key}>
                {key}: {value}%
              </li>
            ))}
          </ul>

          {/* 👇 comment は string 型だから安全 */}
          <p className="text-gray-700 whitespace-pre-wrap">{result.comment}</p>
        </div>
      )}
    </main>
  );
}
