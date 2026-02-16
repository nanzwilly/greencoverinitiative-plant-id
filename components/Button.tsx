import Link from "next/link";

interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "outline" | "green" | "gray";
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
}

export default function Button({
  children,
  href,
  onClick,
  variant = "primary",
  type = "button",
  disabled = false,
  className = "",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-medium text-sm transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#1279be] text-white hover:bg-[#0e6199] focus:ring-[#1279be]",
    secondary:
      "bg-[#ffb302] text-[#303030] hover:bg-[#e09e00] focus:ring-[#ffb302]",
    outline:
      "border border-white/40 text-white hover:bg-white/10 focus:ring-white",
    green:
      "bg-[#0a6b14] text-white hover:bg-[#085a10] focus:ring-[#0a6b14]",
    gray:
      "bg-[#4a4a4a] text-white hover:bg-[#3a3a3a] focus:ring-[#4a4a4a]",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
}
