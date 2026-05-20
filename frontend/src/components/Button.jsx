export default function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "bg-teal text-white hover:bg-teal/90",
    secondary: "bg-white text-ink border border-slate-200 hover:bg-slate-50",
    danger: "bg-coral text-white hover:bg-coral/90",
  };

  return (
    <button
      className={`focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

