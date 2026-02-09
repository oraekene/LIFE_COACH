# LifeOS Coach Design System

**Version:** 1.0  
**Platform:** iOS, Android, Web (Admin Dashboard)  
**Framework Compatibility:** SwiftUI, Jetpack Compose, React + Tailwind

---

## 1. Design Philosophy

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Privacy-First** | Visual cues that reinforce data security (lock icons, local badges, encryption indicators) |
| **Calm & Focused** | Minimal distractions, soft edges, soothing color palette |
| **Personal Growth** | Warm, encouraging aesthetics that inspire action and reflection |
| **Offline-Capable** | Clear indicators for sync state, download progress, connectivity |
| **Coach Persona** | Distinct visual identity per coach while maintaining system coherence |

### Design Mood

> A **trusted mentor's study** — warm, organized, intellectually stimulating yet calming. 
> Think: soft leather textures, warm wood tones, ambient glow, organized bookshelves.

---

## 2. Color System

### 2.1 Primary Palette

```css
:root {
  /* Brand Colors */
  --brand-primary: #2D5A4A;       /* Deep Forest - Trust, Growth */
  --brand-secondary: #B8936A;     /* Warm Bronze - Wisdom, Warmth */
  --brand-accent: #4A9B7F;        /* Sage Green - Calm, Balance */
  
  /* Semantic Colors */
  --success: #34A853;             /* Achievement Green */
  --warning: #F9A825;             /* Mindful Amber */
  --error: #D93025;               /* Alert Red */
  --info: #4285F4;                /* Clarity Blue */
  
  /* Neutrals - Warm Gray Scale */
  --neutral-50: #FAF9F7;          /* Paper */
  --neutral-100: #F3F1ED;         /* Canvas */
  --neutral-200: #E8E4DE;         /* Linen */
  --neutral-300: #D4CFC6;         /* Stone */
  --neutral-400: #A89F91;         /* Driftwood */
  --neutral-500: #7D7468;         /* Bark */
  --neutral-600: #5C554B;         /* Earth */
  --neutral-700: #403B34;         /* Charcoal */
  --neutral-800: #2A2722;         /* Night */
  --neutral-900: #1A1815;         /* Void */
}
```

### 2.2 Dark Mode Palette

```css
[data-theme="dark"] {
  --bg-primary: #1A1815;          /* Deep void */
  --bg-secondary: #2A2722;        /* Elevated surface */
  --bg-tertiary: #403B34;         /* Card surface */
  
  --text-primary: #FAF9F7;        /* Paper white */
  --text-secondary: #D4CFC6;      /* Stone */
  --text-muted: #A89F91;          /* Driftwood */
  
  --brand-primary: #4A9B7F;       /* Lighter sage for dark mode */
  --brand-secondary: #D4A574;     /* Lighter bronze */
}
```

### 2.3 Semantic Color Usage

| Context | Light Mode | Dark Mode | Usage |
|---------|------------|-----------|-------|
| **Background** | `neutral-50` | `neutral-900` | App canvas |
| **Surface** | `white` | `neutral-800` | Cards, modals |
| **Border** | `neutral-200` | `neutral-700` | Dividers, outlines |
| **Coach Chat Bubble** | `brand-accent/10` | `brand-accent/20` | AI responses |
| **User Chat Bubble** | `brand-primary` | `brand-primary` | User messages |

---

## 3. Typography

### 3.1 Type Scale

```css
:root {
  /* Font Families */
  --font-display: 'Outfit', system-ui, sans-serif;    /* Headlines */
  --font-body: 'Inter', system-ui, sans-serif;        /* Body text */
  --font-mono: 'JetBrains Mono', monospace;           /* Code, stats */
  
  /* Size Scale (Mobile-first, rem based) */
  --text-xs: 0.75rem;      /* 12px - Captions */
  --text-sm: 0.875rem;     /* 14px - Secondary */
  --text-base: 1rem;       /* 16px - Body */
  --text-lg: 1.125rem;     /* 18px - Lead text */
  --text-xl: 1.25rem;      /* 20px - Section headers */
  --text-2xl: 1.5rem;      /* 24px - Card titles */
  --text-3xl: 1.875rem;    /* 30px - Page headers */
  --text-4xl: 2.25rem;     /* 36px - Hero text */
  --text-5xl: 3rem;        /* 48px - Display */
  
  /* Line Heights */
  --leading-tight: 1.2;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  
  /* Letter Spacing */
  --tracking-tight: -0.025em;
  --tracking-normal: 0;
  --tracking-wide: 0.025em;
}
```

### 3.2 Type Styles

| Style | Font | Size | Weight | Line Height | Usage |
|-------|------|------|--------|-------------|-------|
| **Display** | Outfit | 48px | 700 | 1.1 | Splash, onboarding |
| **H1** | Outfit | 36px | 600 | 1.2 | Page titles |
| **H2** | Outfit | 24px | 600 | 1.3 | Section headers |
| **H3** | Outfit | 20px | 500 | 1.35 | Card titles |
| **Body** | Inter | 16px | 400 | 1.5 | Main content |
| **Body Small** | Inter | 14px | 400 | 1.5 | Secondary info |
| **Caption** | Inter | 12px | 400 | 1.4 | Timestamps, labels |
| **Button** | Inter | 14px | 500 | 1 | CTA text |
| **Mono** | JetBrains | 13px | 400 | 1.6 | Code, metrics |

---

## 4. Spacing & Layout

### 4.1 Spacing Scale

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;    /* 4px  - Tight spacing */
  --space-2: 0.5rem;     /* 8px  - Element spacing */
  --space-3: 0.75rem;    /* 12px - Compact groups */
  --space-4: 1rem;       /* 16px - Standard */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px - Section spacing */
  --space-8: 2rem;       /* 32px - Large sections */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px - Page margins */
  --space-16: 4rem;      /* 64px - Hero spacing */
  --space-20: 5rem;      /* 80px */
}
```

### 4.2 Container Widths

| Container | Width | Usage |
|-----------|-------|-------|
| **Chat** | 100% (max 720px) | Conversation view |
| **Cards** | 100% (max 400px) | Coach cards, PARA items |
| **Form** | 100% (max 480px) | Input forms |
| **Dashboard** | 100% (max 1280px) | Admin dashboard |
| **Content** | 100% (max 640px) | Article/long-form content |

### 4.3 Breakpoints

```css
:root {
  --screen-sm: 640px;    /* Large phone / small tablet */
  --screen-md: 768px;    /* Tablet portrait */
  --screen-lg: 1024px;   /* Tablet landscape / small desktop */
  --screen-xl: 1280px;   /* Desktop */
  --screen-2xl: 1536px;  /* Large desktop */
}
```

---

## 5. Elevation & Shadows

### 5.1 Shadow Scale

```css
:root {
  /* Soft, warm shadows */
  --shadow-sm: 0 1px 2px rgba(26, 24, 21, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(26, 24, 21, 0.07), 
               0 2px 4px -1px rgba(26, 24, 21, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(26, 24, 21, 0.08), 
               0 4px 6px -2px rgba(26, 24, 21, 0.03);
  --shadow-xl: 0 20px 25px -5px rgba(26, 24, 21, 0.1), 
               0 10px 10px -5px rgba(26, 24, 21, 0.02);
  --shadow-2xl: 0 25px 50px -12px rgba(26, 24, 21, 0.15);
  
  /* Inner shadows for inputs */
  --shadow-inner: inset 0 2px 4px rgba(26, 24, 21, 0.04);
  
  /* Glows for focus states */
  --glow-primary: 0 0 0 3px rgba(45, 90, 74, 0.2);
  --glow-error: 0 0 0 3px rgba(217, 48, 37, 0.2);
}
```

### 5.2 Elevation Layers

| Layer | Shadow | Z-Index | Usage |
|-------|--------|---------|-------|
| **Base** | None | 0 | Background |
| **Raised** | `shadow-sm` | 10 | Cards, list items |
| **Floating** | `shadow-md` | 20 | FAB, tooltips |
| **Modal** | `shadow-xl` | 30 | Sheets, dialogs |
| **Overlay** | `shadow-2xl` | 40 | Full-screen overlays |
| **Toast** | `shadow-lg` | 50 | Notifications |

---

## 6. Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px  - Buttons, badges */
  --radius-md: 0.5rem;    /* 8px  - Inputs, cards */
  --radius-lg: 0.75rem;   /* 12px - Chat bubbles */
  --radius-xl: 1rem;      /* 16px - Modals, sheets */
  --radius-2xl: 1.5rem;   /* 24px - Coach avatars */
  --radius-full: 9999px;  /* Pills, circles */
}
```

---

## 7. Iconography

### 7.1 Icon Library

**Recommended:** [Lucide Icons](https://lucide.dev) — Clean, consistent, open-source

### 7.2 Icon Sizes

| Size | Dimension | Usage |
|------|-----------|-------|
| **xs** | 12px | Inline indicators |
| **sm** | 16px | Button icons, labels |
| **md** | 20px | List items, nav |
| **lg** | 24px | Primary actions |
| **xl** | 32px | Empty states |
| **2xl** | 48px | Feature highlights |

### 7.3 Core Icons

| Function | Icon | Context |
|----------|------|---------|
| **Home** | `Home` | Navigation |
| **Chat** | `MessageCircle` | Coach conversation |
| **PARA** | `FolderTree` | Memory/notes view |
| **Search** | `Search` | Global search |
| **Settings** | `Settings` | Preferences |
| **Coach** | `Sparkles` | AI coach indicator |
| **Offline** | `WifiOff` | No connectivity |
| **Synced** | `CloudCheck` | Sync complete |
| **Syncing** | `RefreshCw` | Sync in progress |
| **Lock** | `Lock` | Encryption/privacy |
| **Download** | `Download` | Coach download |
| **Mic** | `Mic` | Voice input |
| **Send** | `Send` | Submit message |

---

## 8. Motion & Animation

### 8.1 Timing Functions

```css
:root {
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);    /* Natural */
  --ease-in: cubic-bezier(0.4, 0, 1, 1);           /* Accelerate */
  --ease-out: cubic-bezier(0, 0, 0.2, 1);          /* Decelerate */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful */
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275); /* Elastic */
}
```

### 8.2 Duration Scale

```css
:root {
  --duration-instant: 75ms;   /* Micro-interactions */
  --duration-fast: 150ms;     /* Button states */
  --duration-normal: 200ms;   /* Standard transitions */
  --duration-slow: 300ms;     /* Page transitions */
  --duration-slower: 500ms;   /* Complex animations */
}
```

### 8.3 Animation Patterns

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| **Fade In** | 200ms | `ease-out` | Content appearing |
| **Slide Up** | 300ms | `ease-out` | Sheets, modals |
| **Scale Pop** | 150ms | `ease-bounce` | Buttons, badges |
| **Typing Indicator** | Loop 1.5s | `ease-in-out` | Coach thinking |
| **Pulse** | Loop 2s | `ease-in-out` | Sync indicator |
| **Skeleton** | Loop 1.5s | Linear | Loading states |

---

## 9. Component Specifications

### 9.1 Buttons

#### Primary Button
```css
.btn-primary {
  background: var(--brand-primary);
  color: white;
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-md);
  font-weight: 500;
  box-shadow: var(--shadow-sm);
  transition: all var(--duration-fast) var(--ease-default);
}

.btn-primary:hover {
  background: #3D6A5A;  /* 10% lighter */
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(0);
  box-shadow: var(--shadow-sm);
}

.btn-primary:focus-visible {
  outline: none;
  box-shadow: var(--glow-primary);
}
```

#### Button Variants

| Variant | Background | Border | Text | Usage |
|---------|------------|--------|------|-------|
| **Primary** | `brand-primary` | None | White | Main CTAs |
| **Secondary** | Transparent | `neutral-300` | `neutral-700` | Alternative actions |
| **Ghost** | Transparent | None | `brand-primary` | Subtle actions |
| **Danger** | `error` | None | White | Destructive actions |

#### Button Sizes

| Size | Padding | Font Size | Height |
|------|---------|-----------|--------|
| **sm** | 8px 12px | 13px | 32px |
| **md** | 12px 24px | 14px | 40px |
| **lg** | 16px 32px | 16px | 48px |

---

### 9.2 Input Fields

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1.5px solid var(--neutral-300);
  border-radius: var(--radius-md);
  background: var(--neutral-50);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  transition: all var(--duration-fast) var(--ease-default);
}

.input:focus {
  border-color: var(--brand-primary);
  background: white;
  box-shadow: var(--glow-primary);
  outline: none;
}

.input::placeholder {
  color: var(--neutral-400);
}

.input:disabled {
  background: var(--neutral-100);
  color: var(--neutral-400);
  cursor: not-allowed;
}

.input--error {
  border-color: var(--error);
}

.input--error:focus {
  box-shadow: var(--glow-error);
}
```

---

### 9.3 Chat Bubbles

#### User Message
```css
.chat-bubble--user {
  background: var(--brand-primary);
  color: white;
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-lg);
  max-width: 85%;
  margin-left: auto;
  box-shadow: var(--shadow-sm);
}
```

#### Coach Message
```css
.chat-bubble--coach {
  background: rgba(74, 155, 127, 0.08);
  color: var(--neutral-800);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);
  max-width: 85%;
  margin-right: auto;
  border: 1px solid rgba(74, 155, 127, 0.15);
}

/* Coach avatar */
.chat-bubble--coach::before {
  content: '';
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  background: var(--brand-accent);
  /* Position with flexbox parent */
}
```

#### Typing Indicator
```css
.typing-indicator {
  display: flex;
  gap: 4px;
  padding: var(--space-3) var(--space-4);
  background: rgba(74, 155, 127, 0.08);
  border-radius: var(--radius-lg);
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: var(--brand-accent);
  border-radius: var(--radius-full);
  animation: bounce 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) { animation-delay: -0.32s; }
.typing-indicator span:nth-child(2) { animation-delay: -0.16s; }
.typing-indicator span:nth-child(3) { animation-delay: 0; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.6); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}
```

---

### 9.4 Cards

#### Coach Card (Browse View)
```css
.coach-card {
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-default);
}

.coach-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

.coach-card__avatar {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.coach-card__content {
  padding: var(--space-4);
}

.coach-card__name {
  font-family: var(--font-display);
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--neutral-800);
  margin-bottom: var(--space-1);
}

.coach-card__specialty {
  font-size: var(--text-sm);
  color: var(--neutral-500);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.coach-card__download-size {
  font-size: var(--text-xs);
  color: var(--neutral-400);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
```

#### PARA Item Card
```css
.para-card {
  background: white;
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border-left: 4px solid var(--brand-accent);
  box-shadow: var(--shadow-sm);
}

.para-card--project { border-left-color: #4285F4; }  /* Blue */
.para-card--area { border-left-color: #34A853; }     /* Green */
.para-card--resource { border-left-color: #F9A825; } /* Amber */
.para-card--archive { border-left-color: #A89F91; }  /* Gray */
```

---

### 9.5 Navigation

#### Bottom Navigation (Mobile)
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: white;
  border-top: 1px solid var(--neutral-200);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -4px 20px rgba(26, 24, 21, 0.05);
}

.bottom-nav__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  color: var(--neutral-400);
  font-size: var(--text-xs);
  padding: var(--space-2);
  transition: color var(--duration-fast);
}

.bottom-nav__item--active {
  color: var(--brand-primary);
}

.bottom-nav__item--active .bottom-nav__icon {
  transform: scale(1.1);
}
```

---

### 9.6 Status Indicators

#### Sync Status Badge
```css
.sync-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 500;
}

.sync-badge--synced {
  background: rgba(52, 168, 83, 0.1);
  color: var(--success);
}

.sync-badge--syncing {
  background: rgba(66, 133, 244, 0.1);
  color: var(--info);
}

.sync-badge--offline {
  background: rgba(249, 168, 37, 0.1);
  color: var(--warning);
}
```

#### Memory Tier Indicator
```css
.memory-tier {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
}

.memory-tier--hot {
  background: rgba(217, 48, 37, 0.1);
  color: #D93025;
}

.memory-tier--warm {
  background: rgba(249, 168, 37, 0.1);
  color: #F9A825;
}

.memory-tier--cold {
  background: rgba(168, 159, 145, 0.15);
  color: var(--neutral-500);
}
```

---

## 10. Page Templates

### 10.1 Mobile App Structure

```
┌─────────────────────────────────────────┐
│  Status Bar                             │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  Header                          │    │
│  │  • Title (H1)                    │    │
│  │  • Action Icons                  │    │
│  └─────────────────────────────────┘    │
│                                          │
│  ┌─────────────────────────────────┐    │
│  │                                  │    │
│  │                                  │    │
│  │       Main Content Area          │    │
│  │       (Scrollable)               │    │
│  │                                  │    │
│  │                                  │    │
│  │                                  │    │
│  └─────────────────────────────────┘    │
│                                          │
│  [Optional: FAB]                         │
│                                          │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │  Bottom Navigation               │    │
│  │  🏠   💬   📁   🔍   ⚙️           │    │
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

### 10.2 Chat View Layout

```
┌─────────────────────────────────────────┐
│  ← Back    Coach Name    ⋮ Menu         │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 🤖 Coach Avatar                   │   │
│  │    "Hello! How can I help you    │   │
│  │    with your goals today?"       │   │
│  └──────────────────────────────────┘   │
│                                          │
│           ┌─────────────────────────┐   │
│           │ I want to work on my    │   │
│           │ morning routine         │   │
│           └─────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │ 🤖 That's great! I see you      │   │
│  │    mentioned the Berlin Marathon │   │
│  │    project. Would you like to... │   │
│  └──────────────────────────────────┘   │
│                                          │
│  ┌──────────────────────────────────┐   │
│  │     🏃 Project: Berlin Marathon   │   │
│  │     Due: Oct 15, 2026            │   │
│  └──────────────────────────────────┘   │
│                                          │
├─────────────────────────────────────────┤
│  ┌─ Message Input ─────────────────┐   │
│  │ Type your message...     🎤  ➤  │   │
│  └─────────────────────────────────┘   │
│  ┌─ Quick Suggestions ─────────────┐   │
│  │  📝 Capture   🎯 Goals   📊 Review │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 11. Coach Visual Identity System

### 11.1 Coach Avatar Generation

Each coach generates a unique avatar based on:

1. **Primary Color** — Derived from name hash
2. **Icon/Symbol** — Based on category (Health 🌿, Wealth 💎, Wisdom 📚)
3. **Pattern** — Subtle texture overlay (waves, dots, lines)

### 11.2 Category Color Schemes

| Category | Primary | Accent | Icon |
|----------|---------|--------|------|
| **Health** | `#34A853` | `#81C784` | 🌿 |
| **Wealth** | `#F9A825` | `#FFD54F` | 💎 |
| **Wisdom** | `#4285F4` | `#90CAF9` | 📚 |
| **Career** | `#7B1FA2` | `#BA68C8` | 🚀 |
| **Relationships** | `#E91E63` | `#F48FB1` | 💝 |
| **Creativity** | `#FF5722` | `#FFAB91` | ✨ |

### 11.3 Coach Personality Visual Cues

| Personality Template | Chat Style | Avatar Style |
|---------------------|------------|--------------|
| **Socratic** | Question-heavy, italics | Owl, classical patterns |
| **Cheerleader** | Short, exclamation marks | Bright, radiant gradients |
| **Analyst** | Structured, bullet points | Geometric, clean lines |
| **Mentor** | Warm, conversational | Warm tones, organic shapes |

---

## 12. Accessibility (A11y)

### 12.1 Color Contrast

| Pair | Ratio | WCAG Level |
|------|-------|------------|
| `brand-primary` on white | 5.4:1 | AAA |
| Body text on background | 7.2:1 | AAA |
| Muted text on background | 4.8:1 | AA |

### 12.2 Touch Targets

- **Minimum:** 44×44 px (iOS) / 48×48 dp (Android)
- **Recommended:** 48×48 px for primary actions

### 12.3 Focus States

All interactive elements must have visible focus indicators using `--glow-primary` shadow.

### 12.4 Screen Reader Labels

| Element | aria-label Example |
|---------|-------------------|
| Send button | "Send message" |
| Sync badge | "Synced to cloud" |
| Coach card | "Coach Marcus, Stoic philosophy, 45MB download" |
| Memory tier | "Hot memory, accessed 3 days ago" |

---

## 13. Design Tokens Export

### 13.1 SwiftUI

```swift
struct LifeOSTheme {
    static let primary = Color(hex: "2D5A4A")
    static let secondary = Color(hex: "B8936A")
    static let accent = Color(hex: "4A9B7F")
    
    static let spacingXS = CGFloat(4)
    static let spacingSM = CGFloat(8)
    static let spacingMD = CGFloat(16)
    static let spacingLG = CGFloat(24)
    static let spacingXL = CGFloat(32)
    
    static let radiusSM = CGFloat(4)
    static let radiusMD = CGFloat(8)
    static let radiusLG = CGFloat(12)
    static let radiusXL = CGFloat(16)
}
```

### 13.2 Jetpack Compose

```kotlin
object LifeOSTheme {
    val primary = Color(0xFF2D5A4A)
    val secondary = Color(0xFFB8936A)
    val accent = Color(0xFF4A9B7F)
    
    val spacingXS = 4.dp
    val spacingSM = 8.dp
    val spacingMD = 16.dp
    val spacingLG = 24.dp
    val spacingXL = 32.dp
    
    val radiusSM = 4.dp
    val radiusMD = 8.dp
    val radiusLG = 12.dp
    val radiusXL = 16.dp
}
```

### 13.3 Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2D5A4A',
          secondary: '#B8936A',
          accent: '#4A9B7F',
        },
        neutral: {
          50: '#FAF9F7',
          100: '#F3F1ED',
          200: '#E8E4DE',
          300: '#D4CFC6',
          400: '#A89F91',
          500: '#7D7468',
          600: '#5C554B',
          700: '#403B34',
          800: '#2A2722',
          900: '#1A1815',
        },
      },
      fontFamily: {
        display: ['Outfit', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
      },
    },
  },
}
```

---

## 14. Admin Dashboard Specific

### 14.1 Dashboard Layout

```
┌────────────────────────────────────────────────────────────────┐
│  LifeOS Admin                              👤 Admin Name ▾     │
├──────────┬─────────────────────────────────────────────────────┤
│          │                                                      │
│  📊 Home │  My Coaches                                         │
│          │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  🤖 Coaches│                                                    │
│          │  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  📚 Content│ │ Stoic   │  │ Career  │  │ + New   │             │
│          │  │ Coach   │  │ Mentor  │  │ Coach   │             │
│  💰 Revenue│ └─────────┘  └─────────┘  └─────────┘             │
│          │                                                      │
│  ⚙️ Settings│ Recent Activity                                   │
│          │  ┌───────────────────────────────────────────────┐  │
│          │  │ 📈 Downloads: 1,234  │  💬 Sessions: 456      │  │
│          │  └───────────────────────────────────────────────┘  │
└──────────┴─────────────────────────────────────────────────────┘
```

### 14.2 Coach Creation Wizard

**Step Indicators:**
```
   Definition     Personality     Training     Publish
      ●─────────────○─────────────○─────────────○
     Step 1
```

Each step card uses `--shadow-lg` and a thick left border matching progress.

---

## 15. Assets & Resources

### 15.1 Font Loading

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Outfit:wght@500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
```

### 15.2 Icon CDN

```html
<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest/dist/umd/lucide.min.js"></script>
```

---

*This design system should be treated as a living document. As the product evolves, tokens and components should be updated to maintain consistency across all platforms.*
