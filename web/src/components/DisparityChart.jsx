import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
  ResponsiveContainer, ReferenceLine, LabelList,
} from 'recharts';

const ACCENT   = '#E8621A';
const BAR_BASE = '#3B6BAD';
const BAR_DIM  = '#2D4060';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-gray-900 border border-gray-600 rounded p-2 text-xs">
      <p className="font-bold text-orange-400 mb-1">{d.label}</p>
      <p>Est. sentence: <span className="text-white font-mono">{d.estimatedSentence} mo</span></p>
      <p>Incarceration: <span className="text-white font-mono">{d.pctIncarcerated}%</span></p>
      <p className="text-gray-400 text-[10px]">N={d.n?.toLocaleString()}</p>
    </div>
  );
}

export default function DisparityChart({ data, selectedKey, filterImmigration }) {
  if (!data?.length) return null;

  const sortedData = [...data].sort((a, b) => b.estimatedSentence - a.estimatedSentence);

  return (
    <div>
      {/* Filter annotation */}
      <p className="text-[10px] text-yellow-500/80 mb-2 flex items-center gap-1">
        {filterImmigration
          ? '▲ Controlling for offense type narrows but does not eliminate racial gaps'
          : '⚠ Hispanic median is compressed by high-volume, short-sentence immigration cases'}
      </p>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 0, right: 60, left: 4, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fill: '#888', fontSize: 10 }}
            axisLine={{ stroke: '#444' }}
            tickLine={false}
            unit=" mo"
          />
          <YAxis
            type="category"
            dataKey="label"
            width={100}
            tick={{ fill: '#bbb', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#ffffff08' }} />
          <ReferenceLine x={27} stroke="#555" strokeDasharray="4 3"
            label={{ value: 'Median 27mo', fill: '#666', fontSize: 9, position: 'top' }} />
          <Bar dataKey="estimatedSentence" radius={[0, 3, 3, 0]} maxBarSize={20}>
            {sortedData.map(entry => (
              <Cell
                key={entry.key}
                fill={entry.key === selectedKey ? ACCENT : BAR_BASE}
                opacity={entry.key === selectedKey ? 1 : 0.75}
              />
            ))}
            <LabelList
              dataKey="estimatedSentence"
              position="right"
              formatter={v => `${v} mo`}
              style={{ fill: '#aaa', fontSize: 10 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
