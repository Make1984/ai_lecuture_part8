import { NextResponse } from "next/server";
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const { url } = await req.json();

  try {
    const response = await fetch(url);
    const html = await response.text();

    const prompt = `
あなたは文章表現の中立性と正確さをチェックするAIです。
以下のWebページの内容を読み、8つの項目について
「どれくらい正しく・中立的に書かれているか」を
0〜100%で評価してください。

採点のイメージは「どのくらい信頼できるか・公平か」を
割合で示す感じです。
少し厳しく採点してください

各項目の説明：
1. 感情的な言葉づかいが少ないか（落ち着いた表現なら高評価）
2. 主張が一方的すぎないか（バランスが取れていれば高評価）
3. 引用やデータの使い方が正しいか（正確なら高評価）
4. 見出しと本文の内容が一致しているか（ズレがなければ高評価）
5. 断定的すぎる言い方が少ないか（控えめなら高評価）
6. 比喩や誇張が多すぎないか（控えめなら高評価）
7. 画像の使い方が偏っていないか（公平なら高評価）
8. 全体として中立的な立場で書かれているか（中立なら高評価）

出力フォーマットは必ず以下のJSON形式にしてください：

{
  "scores": {
    "感情的表現が少ない": 数値（0〜100）,
    "一方的主張をしていない": 数値（0〜100）,
    "引用文脈が正しい": 数値（0〜100）,
    "見出しと一致している": 数値（0〜100）,
    "断定表現が少ない": 数値（0〜100）,
    "比喩表現が少ない": 数値（0〜100）,
    "画像表現に悪意がないか": 数値（0〜100）,
    "中立性であるか": 数値（0〜100）
  },
  "comment": "全体の印象や改善点を簡単にまとめてください。"
}

HTML内容（抜粋）:
${html.slice(0, 5000)}
`;

    const aiRes = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = aiRes.output_text;
    let parsed;

    try {
      parsed = JSON.parse(text);

      if (parsed?.scores) {
        // 各スコア（%）の平均を算出 → 総合スコア（100点満点に換算）
        const values = Object.values(parsed.scores).map((v: any) => Number(v) || 0);
        const total = values.reduce((sum, v) => sum + v, 0) / values.length;

        parsed.total = Math.round(total); // 小数点切り捨て
      } else {
        parsed = {
          scores: {},
          total: 0,
          comment: "スコアが取得できませんでした。",
        };
      }
    } catch {
      parsed = {
        scores: {},
        total: 0,
        comment: "AIの出力を解析できませんでした。",
      };
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error(error);
    return NextResponse.json({
      scores: {},
      total: 0,
      comment: "評価中にエラーが発生しました。",
    });
  }
}
