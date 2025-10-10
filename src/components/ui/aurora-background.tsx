"use client";

import { cn } from "@/lib/utils";
import React, { ReactNode } from "react";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  showRadialGradient?: boolean;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}: AuroraBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center bg-black text-white",
        className,
      )}
      {...props}
    >
      <div
        className="absolute inset-0 overflow-hidden"
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg,#14b8a6_10%,#0d9488_15%,#2dd4bf_20%,#5eead4_25%,#14b8a6_30%)",
            "--dark-gradient":
              "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
            "--white-gradient":
              "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",

            "--teal-500": "#14b8a6",
            "--teal-600": "#0d9488",
            "--teal-400": "#2dd4bf",
            "--teal-300": "#5eead4",
            "--black": "#000",
            "--white": "#fff",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            `pointer-events-none absolute -inset-[10px] opacity-50 blur-[10px] invert filter will-change-transform`,
            `[background-image:var(--white-gradient),var(--aurora)]`,
            `[background-size:300%,_200%]`,
            `[background-position:50%_50%,50%_50%]`,
            `after:absolute after:inset-0`,
            `after:[background-image:var(--white-gradient),var(--aurora)]`,
            `after:[background-size:200%,_100%]`,
            `after:[background-attachment:fixed]`,
            `after:mix-blend-difference`,
            `after:content-[""]`,
            `after:animate-[aurora_60s_linear_infinite]`,
            `dark:[background-image:var(--dark-gradient),var(--aurora)]`,
            `dark:invert-0`,
            `after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
            `[--aurora:repeating-linear-gradient(100deg,var(--teal-500)_10%,var(--teal-600)_15%,var(--teal-400)_20%,var(--teal-300)_25%,var(--teal-500)_30%)]`,
            `[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]`,
            `[--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]`,
            showRadialGradient &&
              `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`,
          )}
        ></div>
      </div>
      {children}
    </div>
  );
};
