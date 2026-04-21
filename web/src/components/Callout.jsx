import React from 'react';

export default function Callout({ heading, text, variant = 'info' }) {
  const styles = {
    info: 'border-orange-400 bg-orange-950/40 text-orange-200',
    warn: 'border-yellow-500 bg-yellow-950/40 text-yellow-200',
    data: 'border-blue-500 bg-blue-950/40 text-blue-200',
  };
  const icons = { info: '📋', warn: '⚠', data: '📊' };

  return (
    <div className={`border-l-4 rounded-r-lg p-3 mb-3 ${styles[variant]}`}>
      <p className="text-xs font-bold uppercase tracking-widest mb-1 opacity-70">
        {icons[variant]} Did You Know? — {heading}
      </p>
      <p className="text-xs leading-relaxed">{text}</p>
    </div>
  );
}
