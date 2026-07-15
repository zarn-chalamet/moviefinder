interface LogoProps {
  className?: string;
  showText?: boolean;
  textClassName?: string;
}

export default function Logo({ 
  className = 'w-8 h-8', 
  showText = true,
  textClassName = 'text-base font-bold tracking-tight'
}: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`${className} rounded-lg bg-gradient-to-br from-primary-500 via-primary-600 to-accent-500 flex items-center justify-center relative overflow-hidden shadow-lg shadow-primary-500/20`}>
        {/* Inner glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />
        {/* Bottom shadow */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent" />
        
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          className="w-[70%] h-[70%] relative z-10"
        >
          {/* Search circle */}
          <circle
            cx="13"
            cy="13"
            r="8.5"
            stroke="white"
            strokeWidth="2.2"
            fill="none"
          />
          {/* Play triangle inside */}
          <path
            d="M10.5 9.5L16.5 13L10.5 16.5V9.5Z"
            fill="white"
          />
          {/* Search handle */}
          <path
            d="M19.5 19.5L25.5 25.5"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* AI sparkle dot */}
          <circle cx="26" cy="6" r="1.5" fill="white" opacity="0.9" />
          <circle cx="26" cy="6" r="0.5" fill="rgb(139,92,246)" />
        </svg>
      </div>

      {showText && (
        <span className={textClassName}>
          MovieFinder
        </span>
      )}
    </div>
  );
}