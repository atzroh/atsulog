import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

type ButtonVariant = "primary" | "outline";

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
  "flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-gray-900 text-white hover:bg-gray-800 border border-transparent",
  outline:
    "bg-white border border-gray-200 text-muted hover:bg-gray-50 hover:text-foreground hover:border-gray-300",
};

/** A button with the site's primary and outline styles. */
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
      {Icon && <Icon className="size-4" />}
      <span>{children}</span>
    </button>
  );
}
