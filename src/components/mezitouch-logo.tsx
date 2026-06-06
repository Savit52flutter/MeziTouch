import Link from "next/link";

interface MeziTouchLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  linked?: boolean;
}

const SIZE_CLASSES = {
  sm: "h-10 max-w-[220px] sm:h-11 sm:max-w-[260px]",
  md: "h-12 max-w-[260px] sm:h-14 sm:max-w-[320px]",
  lg: "h-14 max-w-[300px] sm:h-16 sm:max-w-[360px]",
} as const;

export function MeziTouchLogo({
  className = "",
  size = "md",
  linked = true,
}: MeziTouchLogoProps) {
  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/mezitouch-logo.png"
      alt="MeziTouch Drug, Alcohol and Addictions Treatment Facility"
      className={`block w-auto object-contain ${SIZE_CLASSES[size]} ${className}`}
    />
  );

  if (!linked) {
    return image;
  }

  return (
    <Link href="/" className="inline-flex shrink-0" aria-label="MeziTouch home">
      {image}
    </Link>
  );
}
