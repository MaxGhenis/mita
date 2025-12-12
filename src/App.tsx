import React, { useEffect } from 'react';
import './App.css';
import ScrollyStory from './components/ScrollyStory';
import { colors, colorsRGB } from './colors';

function App() {
  // Inject color CSS variables from the single source of truth
  useEffect(() => {
    const root = document.documentElement;

    // Mining rock palette
    root.style.setProperty('--mita', colors.mita);
    root.style.setProperty('--mita-dark', colors.mitaDark);
    root.style.setProperty('--mita-darker', colors.mitaDarker);
    root.style.setProperty('--nonmita', colors.nonmita);
    root.style.setProperty('--nonmita-light', colors.nonmitaLight);
    root.style.setProperty('--mita-rgb', colorsRGB.mita);

    // Parchment backgrounds
    root.style.setProperty('--parchment', colors.parchment);
    root.style.setProperty('--parchment-dark', colors.parchmentDark);
    root.style.setProperty('--parchment-cream', colors.parchmentCream);

    // Accent colors
    root.style.setProperty('--terracotta', colors.terracotta);
    root.style.setProperty('--terracotta-dark', colors.terracottaDark);
    root.style.setProperty('--terracotta-light', colors.terracottaLight);
    root.style.setProperty('--copper', colors.copper);
    root.style.setProperty('--ochre', colors.ochre);
    root.style.setProperty('--ochre-light', colors.ochreLight);

    // Text colors
    root.style.setProperty('--text-dark', colors.textDark);
    root.style.setProperty('--text-body', colors.textBody);
    root.style.setProperty('--text-light', colors.textLight);
    root.style.setProperty('--text-muted', colors.textMuted);

    // RGB values
    root.style.setProperty('--parchment-rgb', colorsRGB.parchment);
    root.style.setProperty('--terracotta-rgb', colorsRGB.terracotta);
  }, []);

  return (
    <div className="App">
      <ScrollyStory />
    </div>
  );
}

export default App;
