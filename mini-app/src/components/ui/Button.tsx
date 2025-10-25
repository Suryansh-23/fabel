interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

export function Button({
  children,
  className = "",
  isLoading = false,
  variant = "primary",
  size = "md",
  fullWidth = false,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = "btn";

  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "btn-ghost",
  };

  const sizeClasses = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
  };

  const widthClasses = fullWidth ? "w-full" : "";

  const combinedClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    widthClasses,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const isDisabled = disabled || isLoading;

  return (
    <button className={combinedClasses} disabled={isDisabled} {...props}>
      {isLoading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="spinner-primary h-4 w-4" />
          <span>Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
