# Comprehensive UI/UX Design Guidelines
## Smart Personal DSA Journal & Learning Assistant

---

## Design Philosophy

**Core Principles:**
- **Clarity over decoration** - Every design element serves a functional purpose
- **Content-first** - The design should never compete with the user's notes, code, or diagrams
- **Calm and focused** - Minimal distractions to support deep learning
- **Consistent and predictable** - Similar patterns throughout the app

**Inspiration:** Notion's minimal, content-focused approach with subtle depth and hierarchy

---

## Color System

### Primary Palette (Notion-inspired)

**Light Mode (Default):**
```
Background Colors:
├─ Primary Background: #FFFFFF (pure white)
├─ Secondary Background: #F7F6F3 (warm off-white, for sidebar/panels)
├─ Tertiary Background: #F1F0ED (subtle card backgrounds)
└─ Hover Background: #EBEBEA (interactive element hover)

Text Colors:
├─ Primary Text: #37352F (dark warm gray, almost black)
├─ Secondary Text: #787774 (medium gray, for labels/metadata)
├─ Tertiary Text: #9B9A97 (light gray, for placeholders/hints)
└─ Disabled Text: #C5C4C0

Border Colors:
├─ Default Border: #E9E9E7 (very subtle)
├─ Hover Border: #D3D2CE
└─ Focus Border: #2383E2 (accent color)

Accent Color (The "Two Major Colors" = Background + Accent):
├─ Primary Accent: #2383E2 (blue - for primary actions, links, focus states)
├─ Accent Hover: #1F6FBA
├─ Accent Pressed: #1A5A9A
└─ Accent Light: #E8F3FC (backgrounds for accent elements)
```

**Dark Mode:**
```
Background Colors:
├─ Primary Background: #191919 (warm dark)
├─ Secondary Background: #252525 (sidebar/panels)
├─ Tertiary Background: #2F2F2F (card backgrounds)
└─ Hover Background: #373737

Text Colors:
├─ Primary Text: #EBEBEA (off-white)
├─ Secondary Text: #9B9A97 (medium gray)
├─ Tertiary Text: #6C6C6C (dark gray)
└─ Disabled Text: #4A4A4A

Border Colors:
├─ Default Border: #333333
├─ Hover Border: #454545
└─ Focus Border: #5BA2E8

Accent Color:
├─ Primary Accent: #5BA2E8 (lighter blue for dark mode)
├─ Accent Hover: #7BB5ED
├─ Accent Pressed: #4891D9
└─ Accent Light: #1F3A52
```

### Semantic Colors (Used sparingly, only when needed)

```
Success: #0F7B6C (green - for passed tests, achievements)
Success Light: #E7F6F4

Warning: #DB9E00 (amber - for warnings, review needed)
Warning Light: #FEF5E7

Error: #DF4D37 (red - for failed tests, errors)
Error Light: #FCE8E5

Info: #2383E2 (uses primary accent)
Info Light: #E8F3FC
```

### Difficulty Level Colors (Subtle, not aggressive)

```
Easy: #0F7B6C (green)
Medium: #DB9E00 (amber)
Hard: #DF4D37 (red)

// Applied as subtle badges, not full backgrounds
```

---

## Typography

### Font Family

```css
/* Primary Font - Clean, readable, excellent for code */
font-family: 
  -apple-system, 
  BlinkMacSystemFont, 
  'Segoe UI', 
  'Noto Sans', 
  Helvetica, 
  Arial, 
  sans-serif;

/* Monospace for code */
font-family-mono: 
  'SF Mono', 
  Monaco, 
  'Cascadia Code', 
  'Roboto Mono', 
  Consolas, 
  'Courier New', 
  monospace;
```

### Type Scale

```css
/* Display - Rare, for major headings */
--font-size-display: 28px;
--line-height-display: 1.3;
--font-weight-display: 600;

/* Heading 1 - Page titles */
--font-size-h1: 24px;
--line-height-h1: 1.4;
--font-weight-h1: 600;

/* Heading 2 - Section headings */
--font-size-h2: 20px;
--line-height-h2: 1.4;
--font-weight-h2: 600;

/* Heading 3 - Sub-section headings */
--font-size-h3: 16px;
--line-height-h3: 1.5;
--font-weight-h3: 600;

/* Body - Default text */
--font-size-body: 14px;
--line-height-body: 1.6;
--font-weight-body: 400;

/* Body Small - Labels, metadata */
--font-size-small: 12px;
--line-height-small: 1.5;
--font-weight-small: 400;

/* Tiny - Timestamps, captions */
--font-size-tiny: 11px;
--line-height-tiny: 1.4;
--font-weight-tiny: 400;

/* Code - Inline and blocks */
--font-size-code: 13px;
--line-height-code: 1.5;
```

### Text Styles Usage

```css
/* Page Title */
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #37352F;
  margin-bottom: 8px;
}

/* Section Header */
.section-header {
  font-size: 16px;
  font-weight: 600;
  color: #37352F;
  margin-bottom: 12px;
}

/* Body Text */
.body-text {
  font-size: 14px;
  font-weight: 400;
  color: #37352F;
  line-height: 1.6;
}

/* Label/Metadata */
.label-text {
  font-size: 12px;
  font-weight: 400;
  color: #787774;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Inline Code */
.inline-code {
  font-family: var(--font-family-mono);
  font-size: 13px;
  background: #F1F0ED;
  color: #DF4D37;
  padding: 2px 6px;
  border-radius: 3px;
}
```

---

## Spacing System

**8px Grid System** (Notion uses 4px, but 8px is more forgiving)

```css
--space-1: 4px;   /* Tight spacing within components */
--space-2: 8px;   /* Default small spacing */
--space-3: 12px;  /* Medium spacing */
--space-4: 16px;  /* Standard spacing between elements */
--space-5: 24px;  /* Large spacing between sections */
--space-6: 32px;  /* Extra large spacing */
--space-7: 48px;  /* Section separators */
--space-8: 64px;  /* Major section breaks */
```

**Usage Guidelines:**
- Padding inside buttons: `8px 12px`
- Padding inside cards: `16px`
- Gap between form fields: `12px`
- Margin between sections: `24px`
- Page padding: `24px` (mobile), `48px` (desktop)

---

## Layout Structure

### Main Application Layout

```
┌─────────────────────────────────────────────────────┐
│ Sidebar (240px)    │ Main Content Area             │
│ #F7F6F3           │ #FFFFFF                        │
│                    │                                 │
│ [Navigation]       │ [Page Header]                  │
│ [Quick Actions]    │                                 │
│ [Recent Notes]     │ [Content Blocks]               │
│                    │                                 │
│                    │                                 │
│                    │                                 │
└─────────────────────────────────────────────────────┘
```

**Sidebar:**
- Width: `240px` (fixed)
- Background: `#F7F6F3` (secondary background)
- Border right: `1px solid #E9E9E7`
- Padding: `24px 16px`

**Main Content:**
- Max-width: `900px` (for readability, like Notion)
- Centered with `margin: 0 auto`
- Padding: `48px 64px` (desktop), `24px 16px` (mobile)
- Background: `#FFFFFF`

**Content Width Guidelines:**
- Text blocks: max `720px` (optimal reading width)
- Code blocks: max `900px`
- Diagrams/Excalidraw: max `900px`
- Full-width tables: `100%` up to `900px`

---

## Component Design Specifications

### 1. Buttons

**Primary Button (Accent actions - Submit, Save, Validate)**
```css
.button-primary {
  background: #2383E2;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button-primary:hover {
  background: #1F6FBA;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(35, 131, 226, 0.2);
}

.button-primary:active {
  background: #1A5A9A;
  transform: translateY(0);
}

.button-primary:disabled {
  background: #EBEBEA;
  color: #9B9A97;
  cursor: not-allowed;
}
```

**Secondary Button (Less important actions - Cancel, Back)**
```css
.button-secondary {
  background: transparent;
  color: #37352F;
  border: 1px solid #E9E9E7;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.button-secondary:hover {
  background: #F7F6F3;
  border-color: #D3D2CE;
}

.button-secondary:active {
  background: #F1F0ED;
}
```

**Ghost Button (Tertiary actions - in toolbars)**
```css
.button-ghost {
  background: transparent;
  color: #787774;
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
}

.button-ghost:hover {
  background: #F1F0ED;
  color: #37352F;
}
```

**Button Sizes:**
```css
.button-small { padding: 6px 12px; font-size: 13px; }
.button-medium { padding: 8px 16px; font-size: 14px; } /* default */
.button-large { padding: 10px 20px; font-size: 15px; }
```

### 2. Input Fields

**Text Input**
```css
.input-text {
  width: 100%;
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  color: #37352F;
  transition: all 0.15s ease;
}

.input-text:hover {
  border-color: #D3D2CE;
}

.input-text:focus {
  outline: none;
  border-color: #2383E2;
  box-shadow: 0 0 0 3px #E8F3FC;
}

.input-text::placeholder {
  color: #9B9A97;
}
```

**Input Label**
```css
.input-label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #787774;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

**Input Helper Text**
```css
.input-helper {
  font-size: 12px;
  color: #787774;
  margin-top: 4px;
}

.input-error {
  font-size: 12px;
  color: #DF4D37;
  margin-top: 4px;
}
```

### 3. Cards

**Basic Card (for problem lists, note previews)**
```css
.card {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.card:hover {
  border-color: #D3D2CE;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.card:active {
  transform: translateY(0);
}
```

**Content Block Card (for note blocks - text, code, excalidraw)**
```css
.content-block {
  background: #FFFFFF;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 8px;
  transition: all 0.15s ease;
}

.content-block:hover {
  background: #FAFAF9;
  border-color: #E9E9E7;
}

.content-block:focus-within {
  background: #FFFFFF;
  border-color: #2383E2;
  box-shadow: 0 0 0 3px #E8F3FC;
}
```

**Panel Card (for sidebar sections, analytics panels)**
```css
.panel {
  background: #F7F6F3;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.panel-header {
  font-size: 12px;
  font-weight: 600;
  color: #787774;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
```

### 4. Code Editor Block

```css
.code-block {
  background: #F7F6F3;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
}

.code-block-header {
  background: #EBEBEA;
  border-bottom: 1px solid #E9E9E7;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-block-language {
  font-size: 12px;
  font-weight: 500;
  color: #787774;
  text-transform: uppercase;
}

.code-block-actions {
  display: flex;
  gap: 8px;
}

.code-block-content {
  padding: 16px;
  font-family: var(--font-family-mono);
  font-size: 13px;
  line-height: 1.6;
  color: #37352F;
  overflow-x: auto;
}

/* Code syntax highlighting (minimal) */
.code-keyword { color: #CF222E; }
.code-string { color: #0F7B6C; }
.code-comment { color: #9B9A97; font-style: italic; }
.code-function { color: #8250DF; }
.code-number { color: #0969DA; }
```

### 5. Excalidraw Block

```css
.excalidraw-block {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  min-height: 400px;
}

.excalidraw-toolbar {
  background: #F7F6F3;
  border-bottom: 1px solid #E9E9E7;
  padding: 8px 12px;
  display: flex;
  gap: 4px;
}

.excalidraw-canvas {
  background: #FFFFFF;
  min-height: 400px;
}
```

### 6. Problem Card (in search results)

```css
.problem-card {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.problem-card:hover {
  border-color: #2383E2;
  box-shadow: 0 2px 12px rgba(35, 131, 226, 0.08);
}

.problem-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.problem-title {
  font-size: 15px;
  font-weight: 600;
  color: #37352F;
  margin-bottom: 4px;
}

.problem-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.problem-difficulty {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}

.difficulty-easy {
  background: #E7F6F4;
  color: #0F7B6C;
}

.difficulty-medium {
  background: #FEF5E7;
  color: #DB9E00;
}

.difficulty-hard {
  background: #FCE8E5;
  color: #DF4D37;
}

.problem-platform {
  font-size: 12px;
  color: #787774;
}

.problem-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag {
  font-size: 11px;
  background: #F1F0ED;
  color: #787774;
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #E9E9E7;
}
```

### 7. Flashcard Component

```css
.flashcard {
  background: #FFFFFF;
  border: 2px solid #E9E9E7;
  border-radius: 12px;
  padding: 32px;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
  cursor: pointer;
  transition: all 0.3s ease;
}

.flashcard:hover {
  border-color: #2383E2;
  box-shadow: 0 6px 20px rgba(35, 131, 226, 0.1);
}

.flashcard-question {
  font-size: 18px;
  font-weight: 500;
  color: #37352F;
  margin-bottom: 24px;
}

.flashcard-answer {
  font-size: 16px;
  color: #787774;
  line-height: 1.6;
}

.flashcard-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.flashcard-difficulty-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #E9E9E7;
  cursor: pointer;
  transition: all 0.15s ease;
}

.difficulty-again {
  background: #FCE8E5;
  color: #DF4D37;
  border-color: #DF4D37;
}

.difficulty-hard {
  background: #FEF5E7;
  color: #DB9E00;
  border-color: #DB9E00;
}

.difficulty-good {
  background: #E7F6F4;
  color: #0F7B6C;
  border-color: #0F7B6C;
}

.difficulty-easy {
  background: #E8F3FC;
  color: #2383E2;
  border-color: #2383E2;
}
```

### 8. Test Results Display

```css
.test-results-container {
  background: #F7F6F3;
  border-radius: 8px;
  padding: 24px;
  margin: 24px 0;
}

.test-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.test-results-summary {
  font-size: 20px;
  font-weight: 600;
  color: #37352F;
}

.test-results-count {
  font-size: 14px;
  color: #787774;
}

.test-case {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
}

.test-case-passed {
  border-left: 3px solid #0F7B6C;
}

.test-case-failed {
  border-left: 3px solid #DF4D37;
}

.test-case-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.test-case-title {
  font-size: 13px;
  font-weight: 600;
  color: #37352F;
}

.test-case-status {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-passed {
  background: #E7F6F4;
  color: #0F7B6C;
}

.status-failed {
  background: #FCE8E5;
  color: #DF4D37;
}

.test-case-details {
  font-family: var(--font-family-mono);
  font-size: 12px;
  color: #787774;
  margin-top: 8px;
}

.test-input,
.test-expected,
.test-actual {
  margin-bottom: 6px;
}

.test-label {
  font-weight: 600;
  color: #37352F;
}
```

### 9. Navigation & Sidebar

```css
.sidebar-nav {
  padding: 16px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  color: #787774;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 2px;
}

.nav-item:hover {
  background: #EBEBEA;
  color: #37352F;
}

.nav-item-active {
  background: #E8F3FC;
  color: #2383E2;
  font-weight: 500;
}

.nav-icon {
  width: 18px;
  height: 18px;
  opacity: 0.7;
}

.nav-item-active .nav-icon {
  opacity: 1;
}

.nav-section-header {
  font-size: 11px;
  font-weight: 600;
  color: #9B9A97;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 8px 12px;
  margin-top: 16px;
}
```

### 10. Tags & Badges

```css
.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #F1F0ED;
  color: #787774;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid #E9E9E7;
}

.tag-badge-accent {
  background: #E8F3FC;
  color: #2383E2;
  border-color: #2383E2;
}

.tag-badge-success {
  background: #E7F6F4;
  color: #0F7B6C;
  border-color: #0F7B6C;
}

.status-badge {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
}
```

### 11. Dropdown Menu

```css
.dropdown-menu {
  background: #FFFFFF;
  border: 1px solid #E9E9E7;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 6px;
  min-width: 200px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  color: #37352F;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item:hover {
  background: #F7F6F3;
}

.dropdown-divider {
  height: 1px;
  background: #E9E9E7;
  margin: 6px 0;
}
```

### 12. Modal/Dialog

```css
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #FFFFFF;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #E9E9E7;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #37352F;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #E9E9E7;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

### 13. Toast Notifications

```css
.toast {
  background: #37352F;
  color: #FFFFFF;
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
}

.toast-success {
  background: #0F7B6C;
}

.toast-error {
  background: #DF4D37;
}

.toast-warning {
  background: #DB9E00;
}

.toast-info {
  background: #2383E2;
}
```

---

## Animations & Transitions

**Standard Timing:**
```css
--transition-fast: 0.15s ease;
--transition-medium: 0.2s ease;
--transition-slow: 0.3s ease;
```

**Common Animations:**
```css
/* Hover lift */
.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.hover-lift:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Loading spinner */
@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

## Iconography

**Style:** Line-based, 1.5px stroke, rounded caps
**Size:** 18px × 18px (default), 16px (small), 24px (large)
**Library Recommendation:** Lucide Icons or Heroicons (both match Notion's style)

**Icon Usage:**
- Navigation items: 18px
- Buttons: 16px (small button), 18px (regular)
- Input prefixes: 16px
- Card headers: 18px

---

## Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Mobile landscape */
--breakpoint-md: 768px;   /* Tablet */
--breakpoint-lg: 1024px;  /* Desktop */
--breakpoint-xl: 1280px;  /* Large desktop */

/* Usage */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    transform: translateX(-100%);
  }
  
  .main-content {
    padding: 24px 16px;
  }
}
```

---

## Dark Mode Implementation

**Approach:** Use CSS variables and data attribute
```css
:root {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F7F6F3;
  --text-primary: #37352F;
  --border-default: #E9E9E7;
  /* ... all colors */
}

[data-theme="dark"] {
  --bg-primary: #191919;
  --bg-secondary: #252525;
  --text-primary: #EBEBEA;
  --border-default: #333333;
  /* ... all colors */
}

.element {
  background: var(--bg-primary);
  color: var(--text-primary);
}
```

---

## Accessibility Guidelines

1. **Color Contrast:**
   - Text on background: minimum 4.5:1 ratio
   - Large text (18px+): minimum 3:1 ratio
   - All accent colors meet WCAG AA standards

2. **Focus States:**
   - Always visible focus ring: `box-shadow: 0 0 0 3px #E8F3FC`
   - Never remove outline without replacement

3. **Keyboard Navigation:**
   - All interactive elements reachable via Tab
   - Logical tab order
   - Enter/Space activates buttons

4. **Screen Readers:**
   - Proper semantic HTML (`<button>`, `<nav>`, etc.)
   - ARIA labels for icon-only buttons
   - Alt text for meaningful images

---

## Component State Matrix

### Button States
```
State          | Background | Border    | Shadow
---------------|------------|-----------|------------------
Default        | #2383E2    | none      | none
Hover          | #1F6FBA    | none      | 0 2px 8px rgba()
Active/Pressed | #1A5A9A    | none      | none
Focus          | #2383E2    | 2px blue  | 0 0 0 3px light
Disabled       | #EBEBEA    | none      | none
Loading        | #2383E2    | none      | none + spinner
```

### Input States
```
State    | Border     | Background | Shadow
---------|------------|------------|------------------
Default  | #E9E9E7    | #FFFFFF    | none
Hover    | #D3D2CE    | #FFFFFF    | none
Focus    | #2383E2    | #FFFFFF    | 0 0 0 3px #E8F3FC
Error    | #DF4D37    | #FFFFFF    | 0 0 0 3px #FCE8E5
Disabled | #E9E9E7    | #F7F6F3    | none
```