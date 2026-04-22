/**
 * Sources.jsx — Citations and references page.
 */

import React from 'react';

const SOURCES = [
  {
    id: 1,
    category: 'Primary Data',
    cite: 'U.S. Sentencing Commission. (2024). Individual Offender Datafiles, Fiscal Years 2020–2024. Washington, D.C.: U.S. Sentencing Commission.',
    url: 'https://www.ussc.gov/research/datafiles/commission-datafiles',
    note: 'N=284,823 federal sentences. The primary dataset for all quantitative analyses in this project.',
  },
  {
    id: 2,
    category: 'Primary Data',
    cite: 'U.S. Sentencing Commission. (2024). 2024 Annual Report and Sourcebook of Federal Sentencing Statistics. Washington, D.C.: U.S. Sentencing Commission.',
    url: 'https://www.ussc.gov/research/annual-reports-and-sourcebooks',
    note: 'Summary statistics and trend data used to validate our calculations.',
  },
  {
    id: 3,
    category: 'Race & Sentencing Disparities',
    cite: 'Rehavi, M. M., & Starr, S. B. (2014). Racial disparity in federal criminal sentences. Journal of Political Economy, 122(6), 1320–1354.',
    url: 'https://doi.org/10.1086/677255',
    note: 'Landmark study finding Black men receive sentences ~10% longer than comparably situated White men in federal courts. Uses USSC data.',
  },
  {
    id: 4,
    category: 'Race & Sentencing Disparities',
    cite: 'Starr, S. B., & Rehavi, M. M. (2013). Mandatory sentencing and racial disparity: Assessing the role of prosecutors and the effects of Booker. Yale Law Journal, 123(1), 2–80.',
    url: 'https://www.yalelawjournal.org/article/mandatory-sentencing-and-racial-disparity',
    note: 'Finds prosecutorial charging decisions account for a substantial portion of the racial sentencing gap.',
  },
  {
    id: 5,
    category: 'Race & Sentencing Disparities',
    cite: 'Mustard, D. B. (2001). Racial, ethnic, and gender disparities in sentencing: Evidence from the U.S. federal courts. Journal of Law and Economics, 44(1), 285–314.',
    url: 'https://doi.org/10.1086/320276',
    note: 'Foundational empirical study. Black defendants receive sentences 12.3 months longer; Hispanic defendants 6.2 months longer than comparable Whites.',
  },
  {
    id: 6,
    category: 'Gender & Sentencing',
    cite: 'Starr, S. B. (2015). Estimating gender disparities in federal criminal cases. American Law and Economics Review, 17(1), 127–159.',
    url: 'https://doi.org/10.1093/aler/ahv002',
    note: 'Women receive sentences 63% shorter than men; a disparity larger than the Black-White racial gap.',
  },
  {
    id: 7,
    category: 'Mandatory Minimums',
    cite: 'Families Against Mandatory Minimums. (2023). Federal mandatory minimums. Washington, D.C.: FAMM.',
    url: 'https://famm.org/our-work/federal/mandatory-minimums/',
    note: 'Policy background on mandatory minimum statutes and their disproportionate impact on Black and Hispanic defendants.',
  },
  {
    id: 8,
    category: 'Legal Representation',
    cite: 'American Bar Association. (2019). Gideon\'s broken promise: America\'s continuing quest for equal justice. Chicago: ABA Standing Committee on Legal Aid and Indigent Defendants.',
    url: 'https://www.americanbar.org/groups/legal_aid_indigent_defendants/',
    note: 'Public defenders carry 150+ cases/year on average vs. ~60 for private attorneys.',
  },
  {
    id: 9,
    category: 'Prison Labor & Education',
    cite: 'Davis, L. M., Bozick, R., Steele, J. L., Saunders, J., & Miles, J. N. V. (2013). Evaluating the effectiveness of correctional education: A meta-analysis of programs that provide education to incarcerated adults. Santa Monica, CA: RAND Corporation.',
    url: 'https://www.rand.org/pubs/research_reports/RR266.html',
    note: 'Education programs reduce recidivism by ~43%. Access is limited and waitlisted in most federal facilities.',
  },
  {
    id: 10,
    category: 'Humanization & Criminal Justice',
    cite: 'Goff, P. A., Jackson, M. C., Di Leone, B. A. L., Culotta, C. M., & DiTomasso, N. A. (2014). The essence of innocence: Consequences of dehumanizing Black children. Journal of Personality and Social Psychology, 106(4), 526–545.',
    url: 'https://doi.org/10.1037/a0035663',
    note: 'Informed the avatar system design — humanizing representations of defendants counteract dehumanization effects documented in criminal justice research.',
  },
  {
    id: 11,
    category: 'Children of Incarcerated Parents',
    cite: 'Murphey, D., & Cooper, P. M. (2015). Parents behind bars: What happens to their children? Washington, D.C.: Child Trends.',
    url: 'https://www.childtrends.org/publications/parents-behind-bars-what-happens-to-their-children',
    note: 'Over 2.7 million children in the U.S. have an incarcerated parent.',
  },
  {
    id: 12,
    category: 'Sentencing Guidelines',
    cite: 'U.S. Sentencing Commission. (2023). 2023 Guidelines Manual. Washington, D.C.: U.S. Sentencing Commission.',
    url: 'https://www.ussc.gov/guidelines/2023-guidelines-manual',
    note: 'The official 400+ page federal sentencing guidelines manual referenced in the AccessoryPicker educational tooltips.',
  },
];

const CATEGORIES = [...new Set(SOURCES.map(s => s.category))];
const CATEGORY_COLORS = {
  'Primary Data': '#5A8ED0',
  'Race & Sentencing Disparities': '#E8621A',
  'Gender & Sentencing': '#9966CC',
  'Mandatory Minimums': '#CC4444',
  'Legal Representation': '#44CC88',
  'Prison Labor & Education': '#FFAA00',
  'Humanization & Criminal Justice': '#E8621A',
  'Children of Incarcerated Parents': '#888899',
  'Sentencing Guidelines': '#5A8ED0',
};

export default function Sources() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>

      <div style={{ marginBottom: 40 }}>
        <div style={{ fontSize: 9, color: '#444460', letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 6 }}>
          Bibliography
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: '#E0E0F0', fontFamily: 'monospace' }}>
          Sources & References
        </h1>
        <p style={{ fontSize: 13, color: '#666688', lineHeight: 1.8, maxWidth: 620, marginTop: 10 }}>
          All data sources, academic papers, and policy documents referenced in this project.
          Citations follow Chicago author-date format.
        </p>
      </div>

      {/* Category filter legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 }}>
        {CATEGORIES.map(cat => (
          <span key={cat} style={{
            fontSize: 9, padding: '3px 10px', borderRadius: 20,
            fontFamily: 'monospace', letterSpacing: '0.1em',
            border: `1px solid ${CATEGORY_COLORS[cat] || '#444460'}44`,
            color: CATEGORY_COLORS[cat] || '#666688',
            background: `${CATEGORY_COLORS[cat] || '#444460'}11`,
          }}>
            {cat}
          </span>
        ))}
      </div>

      {/* Reference list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {SOURCES.map(s => (
          <div key={s.id} style={{
            background: '#12121C', border: '1px solid #1E1E2E', borderRadius: 10,
            padding: '16px 20px',
            borderLeft: `3px solid ${CATEGORY_COLORS[s.category] || '#444460'}`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{
                    fontSize: 8, padding: '2px 8px', borderRadius: 10,
                    fontFamily: 'monospace', letterSpacing: '0.1em', textTransform: 'uppercase',
                    border: `1px solid ${CATEGORY_COLORS[s.category] || '#444460'}44`,
                    color: CATEGORY_COLORS[s.category] || '#666688',
                  }}>
                    {s.category}
                  </span>
                  <span style={{ fontSize: 9, color: '#333350', fontFamily: 'monospace' }}>
                    [{s.id}]
                  </span>
                </div>
                <p style={{ fontSize: 12, color: '#C0C0D8', lineHeight: 1.7 }}>
                  {s.cite}
                </p>
                {s.note && (
                  <p style={{ fontSize: 11, color: '#555570', lineHeight: 1.6, marginTop: 6, fontStyle: 'italic' }}>
                    {s.note}
                  </p>
                )}
              </div>
              {s.url && (
                <a href={s.url} target="_blank" rel="noreferrer"
                  style={{
                    fontSize: 9, padding: '4px 10px', borderRadius: 5, flexShrink: 0,
                    border: '1px solid #2A2A3F', color: '#5A8ED0', textDecoration: 'none',
                    fontFamily: 'monospace', letterSpacing: '0.1em', whiteSpace: 'nowrap',
                  }}>
                  ↗ Source
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 40, borderTop: '1px solid #1E1E2E', paddingTop: 20, fontSize: 11, color: '#333350', lineHeight: 1.7 }}>
        <strong style={{ color: '#444460', fontFamily: 'monospace' }}>Disclosure:</strong> This project is for academic and educational purposes only.
        Sentencing estimates in the simulator are based on simplified guideline calculations and
        real USSC group statistics. They do not constitute legal advice and should not be relied
        upon to predict outcomes in any specific case.
      </div>
    </div>
  );
}
