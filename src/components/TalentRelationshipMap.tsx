import { RELATIONSHIP_ORDER, TALENT_BY_KEY, type TalentKey } from "@/lib/talents";

const SIZE = 260;
const CENTER = SIZE / 2;
const POINT_R = 92;
const LABEL_R = 116;

function pointOn(index: number, r: number) {
  const angle = (index / RELATIONSHIP_ORDER.length) * Math.PI * 2 - Math.PI / 2;
  return {
    x: CENTER + r * Math.cos(angle),
    y: CENTER + r * Math.sin(angle),
  };
}

function anchorFor(x: number) {
  if (x < CENTER - 8) return "end";
  if (x > CENTER + 8) return "start";
  return "middle";
}

export default function TalentRelationshipMap({ mainKey }: { mainKey: TalentKey }) {
  const main = TALENT_BY_KEY[mainKey];
  const mainIndex = RELATIONSHIP_ORDER.indexOf(mainKey);
  const mainPt = pointOn(mainIndex, POINT_R);
  const complementIndex = RELATIONSHIP_ORDER.indexOf(main.compatibility.complement);
  const tensionIndex = RELATIONSHIP_ORDER.indexOf(main.compatibility.tension);
  const complementPt = pointOn(complementIndex, POINT_R);
  const tensionPt = pointOn(tensionIndex, POINT_R);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width="100%" style={{ maxWidth: 300, display: "block", margin: "0 auto" }}>
      <circle cx={CENTER} cy={CENTER} r={POINT_R} fill="none" stroke="var(--border)" strokeWidth={1} />

      <line x1={mainPt.x} y1={mainPt.y} x2={complementPt.x} y2={complementPt.y} stroke="var(--brand)" strokeWidth={2} />
      <line
        x1={mainPt.x}
        y1={mainPt.y}
        x2={tensionPt.x}
        y2={tensionPt.y}
        stroke="var(--danger)"
        strokeWidth={2}
        strokeDasharray="4 3"
      />

      {RELATIONSHIP_ORDER.map((key, idx) => {
        const t = TALENT_BY_KEY[key];
        const pt = pointOn(idx, POINT_R);
        const labelPt = pointOn(idx, LABEL_R);
        const isMain = key === mainKey;
        const isComplement = key === main.compatibility.complement;
        const isTension = key === main.compatibility.tension;
        const fill = isMain ? "var(--brand)" : isComplement ? "var(--brand)" : isTension ? "var(--danger)" : "var(--ink-dim)";
        return (
          <g key={key}>
            <circle cx={pt.x} cy={pt.y} r={isMain ? 7 : 5} fill={fill} opacity={isMain ? 1 : 0.85} />
            <text
              x={labelPt.x}
              y={labelPt.y}
              textAnchor={anchorFor(labelPt.x)}
              dominantBaseline="middle"
              fontSize={11.5}
              fontWeight={isMain ? 700 : 500}
              fill={isMain ? "var(--brand)" : "var(--ink)"}
            >
              {t.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
