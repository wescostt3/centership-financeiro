# CenterShip Financeiro Brand Spec

Source reviewed: user-provided CenterShip identity board and field photos. The public site URL was attempted, but the HTTPS fetch failed in this environment, so the attached brand board is treated as the authoritative source.

## CSS Tokens

```css
:root {
  --bg:      oklch(98% 0.003 250);
  --surface: oklch(100% 0 0);
  --fg:      oklch(16% 0.006 250);
  --muted:   oklch(48% 0.012 250);
  --border:  oklch(90% 0.006 250);
  --accent:  oklch(70% 0.14 78);

  --brand-black:   oklch(10% 0.004 250);
  --brand-graphite:oklch(25% 0.007 250);
  --brand-gold:   oklch(70% 0.14 78);
  --brand-silver: oklch(92% 0.005 250);
  --brand-blue:   oklch(56% 0.14 245);

  --success: oklch(58% 0.16 145);
  --warning: oklch(72% 0.15 78);
  --danger:  oklch(57% 0.19 25);

  --font-display: 'Poppins', 'Aptos Display', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-body:    'Poppins', 'Aptos', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', 'JetBrains Mono', ui-monospace, Menlo, monospace;
}
```

## Layout Posture

- Premium technical SaaS: mostly light operational surfaces with graphite navigation and restrained gold emphasis.
- Use the gold accent for primary CTAs, validation states, and key financial highlights; avoid flooding charts or cards with gold.
- Interface density should feel executive and usable daily: 8px radii, hairline borders, tabular numerics, compact tables, clear filters.
- Elevation is subtle and functional; prefer borders, layering, and contrast over decorative shadows.
- Photography can appear on the landing page as operational proof, but the finance app itself should prioritize data, auditability, and document controls.
