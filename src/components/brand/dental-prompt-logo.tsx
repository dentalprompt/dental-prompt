import { cn } from "@/lib/utils";

type DentalPromptLogoProps = {
  className?: string;
  compact?: boolean;
  showTagline?: boolean;
};

export function DentalPromptLogo({ className, compact = false, showTagline = true }: DentalPromptLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <svg
        viewBox="0 0 120 120"
        className="size-12 shrink-0 sm:size-14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="dp-gradient" x1="6" y1="90" x2="115" y2="24" gradientUnits="userSpaceOnUse">
            <stop stopColor="#0A3F9A" />
            <stop offset="1" stopColor="#22C7C7" />
          </linearGradient>
        </defs>
        <path
          d="M29.245 24.247c8.394-9.213 23.454-10.332 34.466-2.992l3.145 2.096 3.145-2.096c11.012-7.34 26.072-6.221 34.466 2.992 8.117 8.909 9.712 22.076 5.087 33.634l-13.84 34.6c-1.908 4.771-8.617 4.238-9.773-.776l-2.068-8.963a18.405 18.405 0 0 0-17.936-14.265H53.118A10.118 10.118 0 0 0 43 78.594v14.493c0 5.027-6.687 5.548-8.674.677L20.49 58.052c-4.625-11.558-3.03-24.725 5.087-33.634Z"
          stroke="url(#dp-gradient)"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M49 49h20.5C81.374 49 91 58.626 91 70.5S81.374 92 69.5 92H54"
          stroke="url(#dp-gradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M49 49v0Zm0 43V67.5c0-4.694 3.806-8.5 8.5-8.5H73"
          stroke="url(#dp-gradient)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 36.5 28 32l4 4.5L28 41l-4-4.5Z"
          fill="#22C7C7"
        />
      </svg>
      {!compact ? (
        <div className="min-w-0">
          <div className="bg-gradient-to-r from-[#0A3F9A] to-[#22C7C7] bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl">
            Dental Prompt
          </div>
          {showTagline ? (
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-slate-500 sm:text-xs">
              Gestao inteligente para sorrisos saudaveis
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
