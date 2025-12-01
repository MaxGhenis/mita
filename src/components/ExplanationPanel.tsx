import React from 'react';

interface ExplanationPanelProps {
  outcome: 'consumption' | 'stunting' | 'roads';
}

const outcomeDetails = {
  consumption: {
    title: 'Household Consumption',
    effect: '~25% lower',
    mechanism: `The mita disrupted the formation of large landed estates (haciendas) inside the
      mita boundary. Outside the boundary, haciendas provided public goods like roads and schools
      to retain workers. Inside, the coerced labor system meant landowners had less incentive to
      invest in their communities.`,
    finding: `Dell finds that households in mita districts have consumption levels approximately
      25% lower than those in non-mita districts, even today—over 200 years after the mita was
      abolished in 1812.`,
  },
  stunting: {
    title: 'Child Stunting',
    effect: '~9 percentage points higher',
    mechanism: `Lower consumption and less public goods provision translate into worse health
      outcomes. Stunting (low height-for-age) is a key indicator of chronic malnutrition during
      early childhood, reflecting both nutritional intake and disease burden.`,
    finding: `Children in former mita districts are approximately 9 percentage points more likely
      to be stunted than children in non-mita districts. This reflects the persistent
      underdevelopment of these regions.`,
  },
  roads: {
    title: 'Road Infrastructure',
    effect: 'Significantly lower density',
    mechanism: `The absence of haciendas in mita regions meant fewer private investments in
      infrastructure. Hacienda owners outside the mita boundary built roads to transport goods
      and attract labor. This infrastructure gap has persisted and widened over centuries.`,
    finding: `Mita districts have substantially less road infrastructure today. This
      infrastructure deficit contributes to lower market access, higher transportation costs,
      and reduced economic opportunities.`,
  },
};

const ExplanationPanel: React.FC<ExplanationPanelProps> = ({ outcome }) => {
  const details = outcomeDetails[outcome];

  return (
    <div className="explanation-panel">
      <div className="explanation-section">
        <h3>The Identification Strategy</h3>
        <div className="strategy-cards">
          <div className="strategy-card">
            <h4>1. Historical Context</h4>
            <p>
              In 1573, Spanish Viceroy Francisco de Toledo established the <em>mita</em>,
              a forced labor system requiring indigenous communities to send workers to
              the Potosí silver mines and Huancavelica mercury mines. The catchment area
              was defined by a geographic boundary.
            </p>
          </div>

          <div className="strategy-card">
            <h4>2. The Natural Experiment</h4>
            <p>
              The mita boundary was drawn based on distance from the mines, not on
              pre-existing differences between communities. Districts just inside and
              just outside the boundary were similar before 1573—but experienced very
              different institutions afterward.
            </p>
          </div>

          <div className="strategy-card">
            <h4>3. Regression Discontinuity</h4>
            <p>
              Dell uses a <strong>geographic regression discontinuity design</strong>:
              comparing outcomes in districts close to either side of the boundary.
              The key assumption is that any "jump" in outcomes at the boundary reflects
              the causal effect of the mita institution.
            </p>
          </div>

          <div className="strategy-card">
            <h4>4. Persistence Mechanisms</h4>
            <p>
              Why do effects persist 200+ years later? The mita prevented hacienda
              formation, which reduced long-term investments in land, infrastructure,
              and human capital. These institutional differences compounded over time.
            </p>
          </div>
        </div>
      </div>

      <div className="explanation-section outcome-details">
        <h3>Current Outcome: {details.title}</h3>
        <div className="outcome-grid">
          <div className="outcome-card effect">
            <h4>Estimated Effect</h4>
            <p className="effect-size">{details.effect}</p>
            <p className="effect-direction">in mita districts compared to non-mita districts</p>
          </div>

          <div className="outcome-card mechanism">
            <h4>Mechanism</h4>
            <p>{details.mechanism}</p>
          </div>

          <div className="outcome-card finding">
            <h4>Key Finding</h4>
            <p>{details.finding}</p>
          </div>
        </div>
      </div>

      <div className="explanation-section methodology">
        <h3>Why This Study Matters</h3>
        <ul>
          <li>
            <strong>Causal identification:</strong> The arbitrary boundary allows Dell to
            isolate the causal effect of institutions on development, rather than just
            showing correlation.
          </li>
          <li>
            <strong>Long-run persistence:</strong> The study demonstrates how colonial
            institutions can shape economic outcomes centuries later—a key finding for
            understanding global inequality.
          </li>
          <li>
            <strong>Mechanism clarity:</strong> By showing that the mita affected land
            tenure patterns, Dell identifies a specific channel through which history
            affects the present.
          </li>
          <li>
            <strong>Policy relevance:</strong> Understanding why some regions remain poor
            helps design targeted interventions to break cycles of underdevelopment.
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ExplanationPanel;
