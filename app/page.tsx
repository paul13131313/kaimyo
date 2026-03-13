"use client";

import { useState } from "react";

type KaimyoResult = {
  kaimyo: string;
  breakdown: {
    inkyo: string;
    dogo: string;
    kaimyo_part: string;
    igo: string;
  };
  explanation: string;
  citation: string;
};

type Phase = "title" | "questions" | "name" | "loading" | "result";

const STEPS = [
  {
    question: "生前の性格",
    choices: ["頑固一徹", "お人好し", "野心家", "享楽主義者", "変わり者"],
  },
  {
    question: "得意だったこと",
    choices: ["飲み食い", "仕事", "口論", "昼寝", "人の世話"],
  },
  {
    question: "大切にしていたもの",
    choices: ["金と地位", "義理と人情", "自由と気まま", "勝利と名誉", "愛と色気"],
  },
  {
    question: "死因のイメージ",
    choices: ["過労死", "食いすぎ", "孤独死", "大往生", "原因不明"],
  },
];

export default function Home() {
  const [phase, setPhase] = useState<Phase>("title");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [result, setResult] = useState<KaimyoResult | null>(null);
  const [error, setError] = useState("");

  const handleChoice = (choice: string) => {
    const newAnswers = [...answers, choice];
    setAnswers(newAnswers);
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      setPhase("name");
    }
  };

  const handleGenerate = async () => {
    if (!name.trim()) return;
    setPhase("loading");
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          personality: answers[0],
          skill: answers[1],
          value: answers[2],
          death: answers[3],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "生成に失敗しました");
      }
      const data = await res.json();
      setResult(data);
      setPhase("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
      setPhase("name");
    }
  };

  const reset = () => {
    setPhase("title");
    setStep(0);
    setAnswers([]);
    setName("");
    setResult(null);
    setError("");
  };

  const shareUrl = result
    ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `わたしの戒名は「${result.kaimyo}」でした。\n\n戒名メーカーであなたの戒名も授かろう！`
      )}&url=${encodeURIComponent("https://kaimyo.vercel.app")}`
    : "";

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 max-w-2xl mx-auto">
      {/* Title Phase */}
      {phase === "title" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-12 animate-fade-up">
          <div className="text-center">
            <div className="washi-border px-12 py-10 inline-block">
              <h1
                className="text-5xl md:text-7xl font-black tracking-wider mb-6"
                style={{ fontFamily: "var(--font-serif), serif" }}
              >
                戒名メーカー
              </h1>
              <p className="text-lg text-[#1a1a1a]/60 tracking-widest">
                あなたの戒名、授けます。
              </p>
            </div>
          </div>
          <button onClick={() => setPhase("questions")} className="shu-btn">
            始める
          </button>
        </div>
      )}

      {/* Questions Phase */}
      {phase === "questions" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full animate-fade-up" key={step}>
          <div className="text-center">
            <div className="text-sm text-[#cc2200] font-bold tracking-widest mb-4">
              問 {step + 1} / {STEPS.length}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
              {STEPS[step].question}
            </h2>
          </div>
          <div className="flex flex-col gap-4 w-full max-w-md">
            {STEPS[step].choices.map((choice) => (
              <button
                key={choice}
                onClick={() => handleChoice(choice)}
                className="choice-btn"
              >
                {choice}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name Input Phase */}
      {phase === "name" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-10 w-full animate-fade-up">
          <div className="text-center">
            <div className="text-sm text-[#cc2200] font-bold tracking-widest mb-4">
              問 5 / 5
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-wide">
              生前の名前を入力
            </h2>
          </div>
          {error && (
            <div className="text-[#cc2200] text-sm font-bold">{error}</div>
          )}
          <div className="flex flex-col gap-6 w-full max-w-md items-center">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="名前を入力"
              className="w-full border-b-2 border-[#1a1a1a] bg-transparent text-center text-2xl py-3 outline-none focus:border-[#cc2200] transition-colors"
              style={{ fontFamily: "var(--font-serif), serif" }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) handleGenerate();
              }}
            />
            <button
              onClick={handleGenerate}
              disabled={!name.trim()}
              className="shu-btn"
            >
              戒名を授かる
            </button>
          </div>
        </div>
      )}

      {/* Loading Phase */}
      {phase === "loading" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-8 animate-fade-up">
          <div className="text-4xl animate-pulse-shu">筆</div>
          <div className="text-lg font-bold tracking-widest text-[#1a1a1a]/60">
            高僧が筆をとっています...
          </div>
        </div>
      )}

      {/* Result Phase */}
      {phase === "result" && result && (
        <div className="flex flex-col items-center gap-10 w-full animate-fade-up">
          {/* Kaimyo vertical display */}
          <div className="washi-border px-10 py-12 flex justify-center">
            <div
              className="kaimyo-vertical text-4xl md:text-6xl text-[#1a1a1a] animate-brush-in"
              style={{ height: "auto", minHeight: "300px" }}
            >
              {result.kaimyo}
            </div>
          </div>

          {/* Breakdown */}
          <div className="w-full space-y-6">
            <h3 className="text-lg font-bold text-[#cc2200] tracking-widest text-center">
              戒名の解説
            </h3>
            <div className="washi-border p-6 space-y-4">
              {[
                { label: "院号", text: result.breakdown.inkyo },
                { label: "道号", text: result.breakdown.dogo },
                { label: "戒名", text: result.breakdown.kaimyo_part },
                { label: "位号", text: result.breakdown.igo },
              ].map((item) => (
                <div key={item.label}>
                  <span className="text-sm font-bold text-[#cc2200] tracking-wider">
                    {item.label}
                  </span>
                  <p className="mt-1 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Explanation */}
          <div className="w-full space-y-4">
            <div className="washi-border p-6">
              <p className="leading-loose text-sm whitespace-pre-wrap">
                {result.explanation}
              </p>
            </div>
            <div className="text-right text-xs text-[#1a1a1a]/50 italic">
              {result.citation}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <button onClick={reset} className="choice-btn px-10">
              もう一度
            </button>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shu-btn inline-flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              シェアする
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto pt-16 text-[#1a1a1a]/20 text-xs tracking-widest">
        戒名メーカー
      </footer>
    </div>
  );
}
