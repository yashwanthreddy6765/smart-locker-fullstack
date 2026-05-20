export default function PageHeader({ title, eyebrow, action }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-sm font-semibold uppercase tracking-wide text-teal">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold text-ink sm:text-3xl">{title}</h1>
      </div>
      {action}
    </div>
  );
}

