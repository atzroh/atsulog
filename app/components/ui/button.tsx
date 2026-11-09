import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "round" | "roundStrong";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  name?: string;
  value?: string;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
};

const BASE_STYLES =
  "flex items-center justify-center space-x-2 border transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

/** Pill buttons in thin caps, like the header; hover turns them sky. */
const ROUND =
  "px-5 py-2 text-xs uppercase tracking-[0.18em] rounded-full bg-white hover:border-sky-600 hover:text-sky-600 cursor-pointer";

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "px-4 py-2 text-sm font-medium rounded-lg bg-gray-900 text-white hover:bg-gray-800 border-transparent",
  round: `${ROUND} border-gray-200 text-muted`,
  roundStrong: `${ROUND} border-foreground text-foreground`,
};

/** A button with the site's primary and round styles. */
export function Button({
  children,
  onClick,
  type = "button",
  name,
  value,
  variant = "primary",
  icon: Icon,
  disabled,
  className = "",
}: ButtonProps) {
  return (
    <button
      type={type}
      name={name}
      value={value}
      onClick={onClick}
      disabled={disabled}
      className={`${BASE_STYLES} ${VARIANTS[variant]} ${className}`}
    >
      {Icon &&
        (variant === "primary" ? (
          <Icon className="size-4" />
        ) : (
          <Icon className="size-3.5" strokeWidth={1.5} />
        ))}
      <span>{children}</span>
    </button>
  );
}
