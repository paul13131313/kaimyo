import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { name, personality, skill, value, death } = await req.json();

  if (!name || !personality || !skill || !value || !death) {
    return NextResponse.json({ error: "すべての項目を入力してください" }, { status: 400 });
  }

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: `あなたは戒名を授ける高僧であり、同時に「魁！男塾」の民明書房の著者でもあります。
以下の形式で出力してください。完全な日本語で。`,
    messages: [
      {
        role: "user",
        content: `以下の人物の戒名を授けてください。

名前：${name}
性格：${personality}
得意：${skill}
大切：${value}
死因：${death}

## 出力形式（JSON）
{
  "kaimyo": "戒名フル（例：豪喰院 猛食大居士）",
  "breakdown": {
    "inkyo": "院号（例：豪喰院）とその意味",
    "dogo": "道号（例：猛食）とその意味",
    "kaimyo_part": "戒名部分とその意味",
    "igo": "位号（例：大居士）とその意味"
  },
  "explanation": "民明書房風の解説文。3〜4段落。もっともらしいが完全にでたらめな仏教・東洋哲学の薀蓄。「〜と伝えられる」「〜とされている」「古来より〜」などの表現を多用。ユーモアと威厳が同居するトーン。",
  "citation": "出典（例：民明書房刊『諡号と魂魄の東洋哲学大全　第三巻』永塚哲之介 著）"
}

JSONのみ返してください。`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  let parsed;
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text);
  } catch {
    return NextResponse.json(
      { error: "戒名の生成に失敗しました", raw: text },
      { status: 500 }
    );
  }

  return NextResponse.json(parsed);
}
