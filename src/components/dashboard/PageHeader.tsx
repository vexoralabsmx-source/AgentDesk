export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="mb-7 border-b border-white/10 pb-6">
      <p className="text-xs font-medium uppercase text-mint">{eyebrow}</p>
      <div className="mt-3 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <h1 className="max-w-3xl text-3xl text-[#fff8eb] md:text-5xl">{title}</h1>
        {children}
      </div>
    </header>
  );
}
