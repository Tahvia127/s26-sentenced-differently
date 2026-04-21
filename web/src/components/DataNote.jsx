import React, { useState } from 'react';

export default function DataNote() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-700 rounded-lg bg-gray-900/60 text-gray-400 text-xs mt-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 hover:text-gray-200 transition-colors"
      >
        <span className="uppercase tracking-widest font-bold text-gray-500">
          About This Data & Methodology
        </span>
        <span className="text-lg">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-700 pt-3">
          <div>
            <p className="font-bold text-gray-300 mb-1">Data Source</p>
            <p>U.S. Sentencing Commission Individual Offender Datafiles, FY2020–FY2024.
              N = 284,823 cases. Obtained from the USSC public data releases.</p>
          </div>

          <div>
            <p className="font-bold text-gray-300 mb-1">Exclusions</p>
            <p>~27,000 rows (~8.7%) were excluded for missing race, sex, or sentence data.
              Exclusions were approximately random with respect to demographic group.</p>
          </div>

          <div>
            <p className="font-bold text-gray-300 mb-1">Hispanic Overrepresentation</p>
            <p>Hispanic defendants represent 52.5% of the dataset, largely due to federal
              immigration enforcement. Immigration cases carry short sentences
              (median 13 months for Hispanic females). Use the Immigration Filter toggle
              to compare non-immigration offenses only.</p>
          </div>

          <div>
            <p className="font-bold text-gray-300 mb-1">Simulator Methodology</p>
            <p>This simulator uses real median sentences from the USSC data, broken down
              by race × sex group. Guideline calculations are simplified from actual
              federal sentencing tables. Individual outcomes vary based on many factors
              not captured here including specific offense conduct, cooperation with
              prosecutors, and judicial discretion.</p>
          </div>

          <div>
            <p className="font-bold text-gray-300 mb-1">Statistical Significance</p>
            <p>All disparity statistics are statistically significant at p &lt; 0.001.
              At N = 284,823, virtually any difference will be significant.
              Effect sizes (e.g., 2.2× sentence ratio) are more meaningful than
              p-values at this sample size.</p>
          </div>

          <div>
            <p className="font-bold text-gray-300 mb-1">What This Data Cannot Tell Us</p>
            <p>These statistics describe disparities in outcomes — they do not resolve
              the question of cause. Disparities may reflect differences in offense
              conduct, guideline application, prosecutorial decisions, judicial
              discretion, or systemic bias. The regression analysis (see the research
              notebooks) controls for legal factors and still finds significant gaps.</p>
          </div>

          <p className="text-gray-600 pt-1">
            Built with React + Recharts. Analysis pipeline: Python / statsmodels / pandas.
            Academic project — not legal advice.
          </p>
        </div>
      )}
    </div>
  );
}
