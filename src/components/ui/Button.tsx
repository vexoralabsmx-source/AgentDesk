import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
};

const variants = {
  primary: "border border-mint/70 bg-mint text-ink shadow-soft hover:bg-[#f0c58f]",
  secondary: "border border-white/10 bg-white/7 text-[#f7eee1] hover:bg-white/12",
  danger: "border border-red-300/20 bg-red-500/14 text-red-100 hover:bg-red-500/24",
  ghost: "border border-transparent bg-transparent text-[#d9cdbc] hover:bg-white/7"
};

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
