import { cn } from "@/lib/utils";

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("text-foreground", className)}
      {...props}
    >
      <defs>
        {/* Bottom path for INDUMENTARIA. 
            Starts a bit below the equator (y=64) to leave room for the dashes */}
        <path 
          id="bottomCurve" 
          d="M 16.2 64 A 44 44 0 0 0 103.8 64" 
          fill="none" 
        />
      </defs>

      {/* Top Arc. 
          Starts a bit above the equator (y=56) to leave room for the dashes */}
      <path
        d="M 16.2 56 A 44 44 0 0 1 103.8 56"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Side Dashes at the equator (y=60) */}
      {/* Left dash */}
      <line 
        x1="11" 
        y1="60" 
        x2="21" 
        y2="60" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />
      {/* Right dash */}
      <line 
        x1="99" 
        y1="60" 
        x2="109" 
        y2="60" 
        stroke="currentColor" 
        strokeWidth="1.2" 
        strokeLinecap="round"
      />

      {/* Bottom Text */}
      <text
        fill="currentColor"
        fontSize="9"
        fontWeight="400"
        letterSpacing="4"
        className="font-sans uppercase"
      >
        <textPath 
          href="#bottomCurve" 
          startOffset="50%" 
          textAnchor="middle"
          dominantBaseline="middle"
        >
          INDUMENTARIA
        </textPath>
      </text>

      {/* Center Text (5inco) */}
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fill="currentColor"
        fontSize="36"
        fontWeight="500"
        fontStyle="italic"
        className="font-serif tracking-tight"
      >
        <tspan fill="url(#goldGradient)">5</tspan>
        <tspan>inco</tspan>
      </text>

      {/* Gradient for the '5' to give it that premium touch */}
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(38, 65%, 50%)" />
          <stop offset="100%" stopColor="hsl(38, 60%, 65%)" />
        </linearGradient>
      </defs>
    </svg>
  );
}
