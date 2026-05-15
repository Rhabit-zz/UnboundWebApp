export function Button({ children, className = "", variant = "solid", size = "md", ...props }) {
  const base =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium border transition";
  const variants = {
    solid: "bg-purple-600 text-white border-purple-600 hover:bg-purple-700",
    outline: "bg-transparent border-yellow-400/50 text-white hover:bg-white/10",
    ghost: "bg-transparent border-transparent text-purple-300 hover:text-white hover:bg-white/10",
  };
  const sizes = {
    lg: "text-base px-5 py-3",
    md: "",
    sm: "text-sm px-3 py-1.5",
  };
  return (
    <button
      className={`${base} ${variants[variant] ?? variants.solid} ${sizes[size] ?? ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
