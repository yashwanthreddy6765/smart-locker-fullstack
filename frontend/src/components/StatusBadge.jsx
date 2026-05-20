const styles = {
  available: "bg-emerald-100 text-emerald-800",
  reserved: "bg-amber-100 text-amber-800",
  inactive: "bg-slate-200 text-slate-700",
  maintenance: "bg-sky-100 text-sky-800",
  active: "bg-emerald-100 text-emerald-800",
  released: "bg-slate-200 text-slate-700",
  expired: "bg-rose-100 text-rose-800",
};

export default function StatusBadge({ value }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${styles[value] || styles.inactive}`}>
      {value}
    </span>
  );
}

