import React from 'react';

const ACCESSORY_GROUPS = [
  {
    label: 'Clothing Add-ons',
    items: [
      { id: 'readingGlasses', icon: '👓', label: 'Reading glasses',  tooltip: '' },
      { id: 'tattooSleeve',   icon: '🖊',  label: 'Tattoo sleeve',   tooltip: '' },
      { id: 'headwrap',       icon: '🎀',  label: 'Head wrap',        tooltip: '' },
      { id: 'baseballCap',    icon: '🧢',  label: 'Baseball cap',     tooltip: '' },
      { id: 'beanie',         icon: '🍡',  label: 'Beanie',           tooltip: '' },
    ],
  },
  {
    label: 'Sentence-Phase Items',
    items: [
      { id: 'lawBooks',  icon: '📚', label: 'Law books',
        tooltip: 'Federal defenders often use the US Sentencing Guidelines Manual — a dense 400-page document that determines sentences.' },
      { id: 'letter',    icon: '✉️',  label: 'Family mail',
        tooltip: 'Over 2.7 million children in the US have a parent who is incarcerated.' },
      { id: 'rosary',    icon: '📿', label: 'Prayer beads',
        tooltip: 'Religious practice is protected under RFRA (Religious Freedom Restoration Act) in federal prisons.' },
      { id: 'gedCert',   icon: '📜', label: 'GED certificate',
        tooltip: 'Education programs reduce recidivism by ~43% (RAND Corp., 2014). Access is limited and waitlisted.' },
      { id: 'workVest',  icon: '🦺', label: 'Work vest',
        tooltip: 'Federal prisoners earn $0.23–$1.15/hr in UNICOR work programs. Private corporations pay similarly low wages for prison labor.' },
    ],
  },
];

function AccItem({ item, active, onToggle }) {
  return (
    <div style={{ position:'relative' }}>
      <button
        onClick={() => onToggle(item.id)}
        title={item.tooltip || item.label}
        style={{
          display:'flex', flexDirection:'column', alignItems:'center', gap:3,
          padding:'6px 4px', borderRadius:6, cursor:'pointer', outline:'none',
          width:54,
          background: active ? 'rgba(232,98,26,0.15)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${active ? '#E8621A' : '#ddd'}`,
          transition: 'all 0.12s',
        }}
      >
        <span style={{ fontSize:18, lineHeight:1 }}>{item.icon}</span>
        <span style={{ fontSize:8, color: active ? '#E8621A' : '#666688', letterSpacing:'0.05em', textAlign:'center', lineHeight:1.2 }}>
          {item.label}
        </span>
        {active && (
          <span style={{ position:'absolute', top:-4, right:-4, width:10, height:10, borderRadius:'50%', background:'#E8621A', fontSize:7, color:'#000', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900 }}>
            ✓
          </span>
        )}
      </button>
    </div>
  );
}

export default function AccessoryPicker({ active, onToggle }) {
  return (
    <div>
      {ACCESSORY_GROUPS.map(group => (
        <div key={group.label} style={{ marginBottom:12 }}>
          <p style={{ fontSize:9, letterSpacing:'0.2em', textTransform:'uppercase', color:'#555', marginBottom:6 }}>
            {group.label}
          </p>
          <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
            {group.items.map(item => (
              <AccItem
                key={item.id}
                item={item}
                active={active.includes(item.id)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
