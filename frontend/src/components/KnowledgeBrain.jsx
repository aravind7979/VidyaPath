import React from 'react';

export default function KnowledgeBrain({ percentage = 0, color = "#0EA5E9", size = "w-16 h-16" }) {
  // Ensure percentage is between 0 and 100
  const validPercentage = Math.min(100, Math.max(0, percentage));
  // Convert percentage to Y coordinate (0% = 100y, 100% = 0y)
  const yPos = 100 - validPercentage;

  return (
    <div className={`relative ${size} group`} title={`${Math.round(validPercentage)}% Mastery`}>
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
        <defs>
          {/* Detailed Brain Silhouette Clip Path */}
          <clipPath id="brain-clip">
            <path d="M 50 10 C 35 10 20 18 15 35 C 12 48 15 62 25 72 C 28 75 30 80 30 85 C 30 88 33 90 36 90 L 64 90 C 67 90 70 88 70 85 C 70 80 72 75 75 72 C 85 62 88 48 85 35 C 80 18 65 10 50 10 Z" />
          </clipPath>

          {/* Wave Animation gradient */}
          <linearGradient id="fluid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        {/* Empty brain background */}
        <path 
          d="M 50 10 C 35 10 20 18 15 35 C 12 48 15 62 25 72 C 28 75 30 80 30 85 C 30 88 33 90 36 90 L 64 90 C 67 90 70 88 70 85 C 70 80 72 75 75 72 C 85 62 88 48 85 35 C 80 18 65 10 50 10 Z" 
          fill="rgba(255,255,255,0.05)" 
          stroke="rgba(255,255,255,0.2)" 
          strokeWidth="2" 
        />

        {/* Fluid Container */}
        <g clipPath="url(#brain-clip)">
          {/* The animated wave/rect */}
          <rect 
            x="0" 
            y={yPos} 
            width="100" 
            height="100" 
            fill="url(#fluid-grad)" 
            className="transition-all duration-[1500ms] ease-out"
          />
          {/* Animated wave tops (Optional SVG trick) */}
          {validPercentage > 0 && validPercentage < 100 && (
            <path 
              d={`M 0 ${yPos} Q 25 ${yPos - 5} 50 ${yPos} T 100 ${yPos} L 100 100 L 0 100 Z`} 
              fill="url(#fluid-grad)"
              className="transition-all duration-[1500ms] ease-out"
            >
              <animate 
                attributeName="d" 
                dur="3s" 
                repeatCount="indefinite" 
                values={`
                  M 0 ${yPos} Q 25 ${yPos - 5} 50 ${yPos} T 100 ${yPos} L 100 100 L 0 100 Z;
                  M 0 ${yPos} Q 25 ${yPos + 5} 50 ${yPos} T 100 ${yPos} L 100 100 L 0 100 Z;
                  M 0 ${yPos} Q 25 ${yPos - 5} 50 ${yPos} T 100 ${yPos} L 100 100 L 0 100 Z
                `}
              />
            </path>
          )}
        </g>

        {/* Brain Cortex Inner Lines for Detail */}
        <path d="M 50 10 C 50 30 45 40 50 90" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
        <path d="M 30 30 C 40 40 30 60 40 70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
        <path d="M 70 30 C 60 40 70 60 60 70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
      </svg>
      
      {/* Overlay percentage text on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A]/80 rounded-[40%] backdrop-blur-sm">
        <span className="text-white font-black text-sm">{Math.round(validPercentage)}%</span>
      </div>
    </div>
  );
}
