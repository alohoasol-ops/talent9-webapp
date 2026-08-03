export default function Topbar({
  roleLabel,
  contextLabel,
  email,
}: {
  roleLabel: string;
  contextLabel?: string;
  email?: string | null;
}) {
  return (
    <div className="topbar no-print">
      <div className="tb-left">
        <span className="tb-brand">9才能ポートフォリオ</span>
        <span className="tb-role">{roleLabel}</span>
        {contextLabel && <span className="tb-role">{contextLabel}</span>}
      </div>
      <div className="tb-right">
        {email && <span>{email}</span>}
        <form action="/api/logout" method="post">
          <button type="submit">ログアウト</button>
        </form>
      </div>
    </div>
  );
}
