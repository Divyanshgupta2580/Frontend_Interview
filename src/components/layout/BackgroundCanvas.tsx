import React from 'react';

export const BackgroundCanvas: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Subtle Atmospheric Ambient Radial Glows (Indigo & Sky tint for depth) */}
      <div 
        className="absolute top-0 left-1/3 -translate-x-1/2 -translate-y-1/3 w-[900px] h-[500px] rounded-full blur-[120px] opacity-70"
        style={{
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(56, 189, 248, 0.04) 50%, transparent 80%)'
        }}
      />
      <div 
        className="absolute top-20 right-1/4 translate-x-1/3 -translate-y-1/4 w-[700px] h-[450px] rounded-full blur-[110px] opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(79, 70, 229, 0.06) 0%, rgba(147, 51, 234, 0.03) 50%, transparent 75%)'
        }}
      />

      {/* Subtle Precision Grid */}
      <div 
        className="absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 40%, transparent 95%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 40%, transparent 95%)'
        }}
      />

      {/* Subtle Dot Grid Layer */}
      <div 
        className="absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(15, 23, 42, 0.12) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          maskImage: 'radial-gradient(circle at 50% 40%, black 30%, transparent 85%)',
          WebkitMaskImage: 'radial-gradient(circle at 50% 40%, black 30%, transparent 85%)'
        }}
      />

      {/* Architectural Clean Crosshairs (+) */}
      <div className="absolute top-24 left-12 text-indigo-400 font-mono text-xs select-none opacity-40">
        +
      </div>
      <div className="absolute top-24 right-12 text-indigo-400 font-mono text-xs select-none opacity-40">
        +
      </div>
      <div className="absolute top-[480px] left-16 text-slate-400 font-mono text-xs select-none opacity-30">
        +
      </div>
      <div className="absolute top-[480px] right-16 text-slate-400 font-mono text-xs select-none opacity-30">
        +
      </div>

      {/* Clean Top Border Light Line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent" />
    </div>
  );
};
