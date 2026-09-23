"use client";

import { useState } from "react";
import { CHART_ORDER, TALENT_BY_KEY, type TalentKey } from "@/lib/talents";

type Detail = { scenes: string; grow: string; caution: string };

const DETAILS: Record<TalentKey, Detail> = {
  logic: {
    scenes: "データや事実を整理して判断するとき、複雑な情報を筋道立てて説明するとき、リスクや矛盾を検証してから進めるとき。",
    grow: "結論だけでなく「なぜそう言えるか」の根拠をセットで示す習慣をつける。数字やファクトで語る場数を増やす。",
    caution: "分析に時間をかけすぎて決断が遅れがち。完璧な根拠を待たず、8割の確度で動く判断も持つ。",
  },
  create: {
    scenes: "前例のない企画やアイデア出し、新規事業や商品開発、行き詰まった状況の突破口を探すとき。",
    grow: "思いついたアイデアを小さく形にして試す。質より量から始め、数を出すことを恐れない。",
    caution: "アイデアを出すだけで実行が続かないことがある。形にする人と組む、または実行計画までセットにする。",
  },
  empathy: {
    scenes: "困っている人を支えるとき、対立や不安を和らげるとき、一人ひとりに寄り添って信頼を築くとき。",
    grow: "相手の話を最後まで聴く。代わりにやるのではなく、一緒に考えて支える関わりを意識する。",
    caution: "人を優先しすぎて自分が抱え込みやすい。線引きと、自分自身のケアも忘れずに。",
  },
  lead: {
    scenes: "人を巻き込んで前進させるとき、ビジョンや思いを伝えて共感を集めるとき、チームに勢いをつけるとき。",
    grow: "「なぜやるのか」を自分の言葉で語る。相手の感情に響く伝え方を磨く。",
    caution: "勢いで周囲を置き去りにしがち。着実に進めたい人への配慮と、こまめなフォローをセットに。",
  },
  intro: {
    scenes: "バラバラな情報や意見を束ねるとき、全体像や方針を描くとき、複数の視点を一つに整理するとき。",
    grow: "部分を俯瞰して共通点や構造を見つける練習。まとめた結果を分かりやすく共有する。",
    caution: "全体を見すぎて動き出しが遅れることがある。まとめと同時に「次の一歩」も示す。",
  },
  expr: {
    scenes: "人や情報をつなぐとき、社内外を橋渡しするとき、新しい関係や輪を広げるとき。",
    grow: "接点を意図的に増やす。つないだ後のフォローまでやり切り、関係を育てる。",
    caution: "広げるだけで深まらないことがある。つないだ先を活かす・定着させる視点を持つ。",
  },
  space: {
    scenes: "無駄を省いて効率を上げるとき、使いやすさや仕上がりを高めるとき、仕組みや資料を磨くとき。",
    grow: "「もっと良くできないか」を小さく改善し続ける。ビフォーアフターを可視化して共有する。",
    caution: "細部にこだわりすぎて時間がかかることがある。どこまで整えるか、合格ラインを先に決める。",
  },
  body: {
    scenes: "人や役割を束ねるとき、継続して回る仕組みを整えるとき、全体を統括して運営するとき。",
    grow: "属人的な業務を仕組みに置き換える。任せる・権限委譲して回す経験を積む。",
    caution: "仕組み優先で人の気持ちが後回しになりがち。現場の声を拾い、柔軟さも残す。",
  },
  order: {
    scenes: "地道な作業を着実に続けるとき、品質や記録を安定して守るとき、長期でコツコツ積み上げるとき。",
    grow: "小さな積み重ねを記録して可視化する。継続の仕組み（ルーティン化）をつくる。",
    caution: "決まったやり方に固執しがち。新しいやり方も時々取り入れ、変化に慣れておく。",
  },
};

export default function TalentGuide({ step = "06" }: { step?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="panel no-print">
      <h2>
        <span className="n">{step}</span>　9才能の詳しい解説
      </h2>
      <p className="panel-sub">
        9つの才能それぞれの意味と、活かし方・伸ばし方・注意点をまとめています。
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          style={{
            marginLeft: 8,
            border: "1px solid var(--line, #d5d9e0)",
            borderRadius: 999,
            padding: "2px 12px",
            fontSize: 12.5,
            cursor: "pointer",
            background: "transparent",
          }}
        >
          {open ? "閉じる" : "すべて開く"}
        </button>
      </p>

      {open && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 12,
          }}
        >
          {CHART_ORDER.map((k) => {
            const t = TALENT_BY_KEY[k];
            const d = DETAILS[k];
            return (
              <div
                key={k}
                style={{
                  border: "1px solid var(--line, #d5d9e0)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  background: "var(--surface, #fff)",
                }}
              >
                <div style={{ marginBottom: 6 }}>
                  <strong style={{ fontSize: 15 }}>{t.name}</strong>
                </div>
                <p style={{ fontSize: 12.5, margin: "0 0 10px", lineHeight: 1.6 }}>{t.def}</p>
                <Block label="こんな場面で活きる" text={d.scenes} />
                <Block label="伸ばし方" text={d.grow} />
                <Block label="注意点" text={d.caution} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Block({ label, text }: { label: string; text: string }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <p style={{ fontSize: 11.5, fontWeight: 700, color: "var(--ink)", margin: "0 0 2px" }}>{label}</p>
      <p style={{ fontSize: 12, color: "var(--ink-dim)", margin: 0, lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}
