# JobTransit UI/UX Design System Specification

> **Reference Anchor**: Landing Hero Interface (Full-Screen 3D Transit Hub Architecture, Frosted Glassmorphism, and Atmospheric Left-Wash Typography).

---

## 1. Design Vision & Philosophy

JobTransit's visual language embodies the **"Transit & Forward Journey"** metaphor for modern tech career transitions:

* **Architectural & Future-Forward**: Evokes modern transit terminals, sleek rapid transit systems, and well-engineered career pathways rather than generic corporate job boards.
* **Atmospheric Minimalism**: Deep, cinematic visual depth paired with airy, distraction-free surfaces. Elements float above dynamic environments without visual clutter.
* **Frosted Glassmorphism**: High-grade frosted glass surfaces (`backdrop-filter: blur`, translucent specular border highlights, subtle inner shadows, and saturation boosts) providing separation and tactile depth.
* **Editorial Legibility**: Heavy, dark editorial typography anchored in high-contrast atmospheric washes, guaranteeing crystal-clear legibility over complex 3D environments.

---

## 2. Key Elements from the Reference Image

| Interface Area | Visual Treatment | Implementation Details |
| :--- | :--- | :--- |
| **Top-Left Brand Mark** | Floating logo + logotype without any bounding container box, preserving maximum scenic visibility. | Geometric transit arrow logo (`JobTransitLogo.png`) + `JobTransit` text in `#111827`, font-bold, tracking-tight. |
| **Top-Right Action** | Frosted glass pill button with upward-right transit arrow. | `glass-btn`: Translucent background (`rgba(255,255,255,0.22)`), `backdrop-blur(14px)`, `1px solid rgba(255,255,255,0.4)`, subtle inset glow, hover micro-translation (`translate-x-0.5 -translate-y-0.5` on icon). |
| **Scenic Background** | Cinematic tilt-shift 3D architectural transit hub. Clean white geometric urban buildings, trains on tracks, wet ground reflections under soft daylight. | Full-bleed video/image canvas (`object-cover w-full h-full`) with smooth fade-in loading state. |
| **Atmospheric Wash** | Soft, diffused white radial-gradient illumination positioned at the lower-left. | `.left-fade-wash`: Radial gradient ellipse + horizontal gradient fade + mask image ensuring typography contrast without hard dark overlays. |
| **Hero Typography Anchor** | Bottom-left pinned editorial layout. High-impact headline stacked in two crisp lines with supportive subtext. | **H1**: `"Your Next Move / Starts Here."` (tight negative tracking `-0.03em`, leading `1.08`, dark slate `#111827`).<br>**P**: Max-width constrained paragraph explaining the platform's value proposition. |

---

## 3. Color Palette & Surface Tokens

### Primary & Typography Colors
* **Headline / Primary Text**: `#111827` (Slate 900 / Deep Charcoal) — Crisp, ink-like contrast against the atmospheric wash.
* **Body / Secondary Text**: `#1e293b` – `#334155` (Slate 700 / 800) — High legibility with softer tone.
* **Muted / Caption Text**: `#64748b` (Slate 500) — For micro-copy, timestamps, and secondary labels.

### Brand & Accent Accents
* **Transit Accent Orange**: `#ea580c` / `#f97316` / `#fb923c` — Signifies trajectory, live track lines, and active actions (echoing the JobTransit logo and train livery).
* **Navigator Blue / Indigo**: `#2563eb` / `#4f46e5` — Highlights technology pathways, compass indicators, and skill tags.
* **Success Emerald**: `#10b981` / `#059669` — Live indicators, matching score bars, and positive readiness.
* **Progress Amber**: `#f59e0b` — Top recommendation highlights and skill catchup counters.

### Glassmorphism & Material Tokens
```css
/* Glass Button (as seen in 'Get Started ↗') */
.glass-btn {
  background: rgba(255, 255, 255, 0.22);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.08), inset 0 1px 1px 0 rgba(255, 255, 255, 0.45);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Atmospheric Bottom-Left Contrast Wash */
.left-fade-wash {
  position: absolute;
  inset-y: 0;
  left: 0;
  width: 65%;
  max-width: 980px;
  pointer-events: none;
  background: radial-gradient(
    ellipse 85% 70% at 0% 90%,
    rgba(255, 255, 255, 0.96) 0%,
    rgba(255, 255, 255, 0.82) 35%,
    rgba(255, 255, 255, 0.45) 65%,
    transparent 100%
  );
  backdrop-filter: blur(4px);
  mask-image: linear-gradient(to right, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.85) 45%, transparent 95%);
}

/* Floating Navigation Dock / Card Panels */
.glass-panel {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(24px) saturate(190%);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 8px 32px 0 rgba(15, 23, 42, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.85);
}

/* Catchup Tab Atmospheric Cloudy Sky & Refractive Glass */
.catchup-glass-card {
  background: rgba(255, 255, 255, 0.60);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.80);
  box-shadow: 0 12px 35px -5px rgba(15, 23, 42, 0.05), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95);
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.catchup-glass-card:hover {
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 20px 50px rgba(15, 23, 42, 0.12), inset 0 1px 1px 0 rgba(255, 255, 255, 1);
}
```

---

## 4. Typography Hierarchy

JobTransit relies on **Plus Jakarta Sans** as the lead typeface, supported by **Outfit** and **Inter** for numerals and technical readouts.

| Role | Font Family | Size | Weight | Tracking & Leading |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Headline** | `Plus Jakarta Sans` | `2.5rem` – `3.5rem` (`40px` – `56px`) | `600` (SemiBold) | Tracking: `-0.03em`, Line-Height: `1.08` |
| **Section Titles** | `Plus Jakarta Sans` | `1.5rem` – `2.25rem` (`24px` – `36px`) | `700` (Bold) | Tracking: `-0.025em`, Line-Height: `1.2` |
| **Hero Subtitle** | `Plus Jakarta Sans` / `Inter` | `0.875rem` – `1rem` (`14px` – `16px`) | `400` (Regular) | Tracking: `normal`, Line-Height: `1.65` |
| **Interactive Buttons** | `Plus Jakarta Sans` | `0.875rem` – `1rem` (`14px` – `16px`) | `600` (SemiBold) | Tracking: `-0.01em` |
| **Labels & Badges** | `Plus Jakarta Sans` | `0.625rem` – `0.75rem` (`10px` – `12px`)| `700` (Bold) | Tracking: `+0.05em` (Uppercase) |

---

## 5. Layout & Spatial System

### Landing Viewport Composition
1. **Header Region**: Fixed to `top: 0`, full width, `padding: 24px 40px` (desktop), `z-index: 30`. Pointer-events pass-through except on interactive child elements (`pointer-events-auto`).
2. **Hero Typography Anchor**: Pinned strictly to bottom-left:
   - `bottom: 2rem` to `4rem` (`32px` – `64px`)
   - `left: 1.5rem` to `5rem` (`24px` – `80px`)
   - Maximum width constrained to `38rem` (`608px`) to allow the 3D train station and architectural skyline to remain the visual focal point in the center and right.
3. **Background Canvas**: Fixed full-viewport layer (`100vw × 100vh`, `overflow: hidden`) beneath the UI hierarchy.

### Logged-In Application Layout
* **Top Floating Nav Dock**: Centered macOS-style pill container (`glass-pill-dock`) with segmented icons (`Home`, `Transit`, `Catchup`, `Trend`, `Profile`).
* **Content Cards**: Elevated ambient cards (`.glass-card-ambient`) simulating modern boarding passes and transit status boards with smooth hover elevations (`translateY(-2px)`).

---

## 6. Motion & Interaction Principles

* **Spring Physics & Curves**: Standard UI transitions use `cubic-bezier(0.16, 1, 0.3, 1)` with durations between `200ms` and `350ms`.
* **Directional Cues**:
  * Action buttons (like `"Get Started ↗"`) trigger micro-translations on icon cues (`group-hover:translate-x-0.5 group-hover:-translate-y-0.5`).
  * Hovering glass elements slightly boosts surface brightness (`rgba(255,255,255,0.35)`) and border opacity (`rgba(255,255,255,0.65)`).
* **Depth & Parallax**: Natural layering provides depth without heavy drop shadows; specular top-edge borders (`inset 0 1px 1px white`) simulate light falling on real frosted glass.
