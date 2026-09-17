export default function SeccionAdmin({
  eyebrow,
  titulo,
  color = "amarillobrillante",
  children,
}: {
  eyebrow: string;
  titulo: string;
  color?: "amarillobrillante" | "chalk" | "coral";
  children: React.ReactNode;
}) {
  const colorClass = { amarillobrillante: "text-amarillobrillante", chalk: "text-chalk", coral: "text-coral" }[color];
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
