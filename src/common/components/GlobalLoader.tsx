import React from 'react';

const GlobalLoader: React.FC = () => (
<div className="fixed inset-0 backdrop-blur-none flex items-center justify-center z-[4000]">
    <div className="flex items-end justify-center space-x-2 h-16" aria-label="Loading content...">
      <div className="w-3 h-8 bg-primary animate-waveform" style={{ animationDelay: '0s' }}></div>
      <div className="w-3 h-12 bg-primary animate-waveform" style={{ animationDelay: '0.2s' }}></div>
      <div className="w-3 h-16 bg-primary animate-waveform" style={{ animationDelay: '0.4s' }}></div>
      <div className="w-3 h-12 bg-primary animate-waveform" style={{ animationDelay: '0.6s' }}></div>
      <div className="w-3 h-8 bg-primary animate-waveform" style={{ animationDelay: '0.8s' }}></div>
    </div>
  </div>
);

export default GlobalLoader;
