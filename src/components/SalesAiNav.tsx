import Link from "next/link";

const TABS = [
  { href: "/dashboard/sales-ai", label: "ダッシュボード" },
  { href: "/dashboard/sales-ai/profile", label: "企業情報・診断" },
  { href: "/dashboard/sales-ai/icp", label: "理想顧客(ICP)" },
  { href: "/dashboard/sales-ai/leads", label: "リード管理" },
] as const;

export default function SalesAiNav({ active }: { active: (typeof TABS)[number]["href"] }) {
  return (
    <div className="badge-row no-print" style={{ marginBottom: 20 }}>
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="btn"
          style={
            tab.href === active
              ? { background: "var(--brand)", color: "var(--surface)", borderColor: "var(--brand)" }
              : undefined
          }
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
