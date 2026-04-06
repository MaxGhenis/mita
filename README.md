# mita

Interactive scrollytelling visualization of Dell (2010), "The Persistent Effects of Peru's Mining Mita" (*Econometrica*). The viz walks through the regression discontinuity design step by step, morphing a geographic map of Peruvian districts into an RD scatter plot.

**Live at [maxghenis.com/mita](https://maxghenis.com/mita)**

The visualization presents Dell's original findings alongside notes on subsequent literature, including Arroyo Abad & Maurer (2024), who argue the mita's effects dissipated during the colonial era, and Kelly (2020), who highlights spatial autocorrelation concerns in persistence studies more broadly.

## Scripts

- `bun dev` starts the Next.js dev server.
- `bun run build` creates a static export in `out/`.
- `bun run test` runs the Vitest suite.
- `bun run deploy` publishes `out/` via `gh-pages`.

## Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS 4
- Vitest for tests
- GitHub Pages deployment from the static `out/` export

## Notes

- Production builds export under `/mita`, matching the GitHub Pages path.
- The existing D3/scrollytelling CSS has been preserved; Tailwind is now configured for incremental refactors instead of a risky full rewrite.
