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
            <path d="M 56.6 91.2 C 57.5 91.6 57.1 93 56.1 93 L 49.3 93 C 48.3 93 47.8 91.6 48.6 91 L 52.8 84.7 C 32.5 83.8 15 68.6 15 48 C 15 28.1 30.6 12 50 12 C 69.4 12 85 28.1 85 48 C 85 64.9 73.2 79.1 57.4 83.6 L 56.6 91.2 Z" />
            <path d="M 57.4 83.6 C 65 88 80 88 85 75 C 82 70 70 70 59.8 74" />
          </clipPath>

          {/* Wave Animation gradient */}
          <linearGradient id="fluid-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.8" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
        </defs>

        <g fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="2">
          <path d="M 56.6 91.2 C 57.5 91.6 57.1 93 56.1 93 L 49.3 93 C 48.3 93 47.8 91.6 48.6 91 L 52.8 84.7 C 32.5 83.8 15 68.6 15 48 C 15 28.1 30.6 12 50 12 C 69.4 12 85 28.1 85 48 C 85 64.9 73.2 79.1 57.4 83.6 L 56.6 91.2 Z" />
          {/* Cerebellum part */}
          <path d="M 57.4 83.6 C 65 88 80 88 85 75 C 82 70 70 70 59.8 74" fill="rgba(255,255,255,0.02)" />
        </g>

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

        <path d="M 50 12 C 50 30 45 40 50 83" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" />
        <path d="M 30 30 C 40 40 30 60 40 70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
        <path d="M 70 30 C 60 40 70 60 60 70" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" fill="none" strokeDasharray="4 2" />
        <path d="M 40 25 C 45 20 55 20 60 25" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" />
        <path d="M 35 45 C 45 40 55 40 65 45" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" />
        <path d="M 40 65 C 45 60 55 60 60 65" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" fill="none" />
      </svg>
      
      {/* Overlay percentage text on hover */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-[#0F172A]/80 rounded-[40%] backdrop-blur-sm">
        <span className="text-white font-black text-sm">{Math.round(validPercentage)}%</span>
      </div>
    </div>
  );
}
