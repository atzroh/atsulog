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

/**
 * A button with the site's primary and outline styles.
 */
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
  const baseStyles =
    "flex items-center justify-center space-x-[0.5rem] px-[1rem] py-[0.5rem] text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-gray-900 text-white hover:bg-gray-800 border border-transparent",
    outline:
      "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-black hover:border-gray-300",
  };

  return (
    <button
      type={type}
      name={name}
      value={value}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="size-4" />}
      <span>{children}</span>
    </button>
  );
}
