import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

import { MeziTouchLogo } from "@/components/mezitouch-logo";

export function PageShell({
  children,
  className = "",
  showLogo = true,
}: {
  children: ReactNode;
  className?: string;
  showLogo?: boolean;
}) {
  return (
    <div className={`min-h-full bg-mezi-cream text-mezi-text ${className}`}>
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col px-4 py-8 sm:px-6">
        {showLogo ? (
          <div className="mb-8 flex justify-center">
            <MeziTouchLogo />
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-mezi-border bg-mezi-surface p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variants = {
    primary:
      "bg-mezi-primary text-white hover:bg-mezi-primary-hover disabled:bg-mezi-gray disabled:text-mezi-muted",
    secondary:
      "border border-mezi-gray bg-mezi-cream-soft text-mezi-primary hover:bg-mezi-cream",
    ghost: "bg-transparent text-mezi-muted hover:bg-mezi-cream-soft",
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-xl border border-mezi-gray bg-mezi-surface px-4 py-3 text-mezi-text outline-none ring-mezi-teal-light/40 placeholder:text-mezi-muted focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-mezi-gray bg-mezi-surface px-4 py-3 text-mezi-text outline-none ring-mezi-teal-light/40 placeholder:text-mezi-muted focus:ring-2 ${className}`}
      {...props}
    />
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-sm font-medium text-mezi-muted">
      {children}
    </label>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-mezi-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-mezi-primary">
      {children}
    </span>
  );
}
