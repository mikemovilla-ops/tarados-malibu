export default function SeccionAdmin({
  eyebrow,
  titulo,
  color = "malibubright",
  children,
}: {
  eyebrow: string;
  titulo: string;
  color?: "malibubright" | "chalk" | "coral";
  children: React.ReactNode;
}) {
  const colorClass = { malibubright: "text-malibubright", chalk: "text-chalk", coral: "text-coral" }[color];
  return (
    <section className="card p-4 space-y-3">
      <div>
        <p className={`text-[10px] uppercase tracking-[0.15em] ${colorClass}`}>{eyebrow}</p>
        <h2 className="font-display text-lg">{titulo}</h2>
      </div>
      {children}
    </section>
  );
}
