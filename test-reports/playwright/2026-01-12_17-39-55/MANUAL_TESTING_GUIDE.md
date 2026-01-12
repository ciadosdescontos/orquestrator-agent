# Manual Browser Testing Guide
## UI/UX Dashboard & Chat Improvements

**Spec:** ui-ux-dashboard-chat-improvements.md
**Application URL:** http://localhost:5173
**Estimated Time:** 30-45 minutes

---

## Prerequisites

✅ Frontend server running on http://localhost:5173
✅ Backend server running on http://localhost:3001
✅ Browser DevTools available (Chrome recommended)
✅ Test data: Long text sample (10+ lines for textarea testing)

---

## Test Session Setup

### 1. Browser Configuration
- Open Chrome/Firefox/Safari
- Navigate to http://localhost:5173
- Open DevTools (F12 or Cmd+Option+I)
- Enable Responsive Design Mode (optional for mobile testing)

### 2. Create Test Data
Prepare this long text sample for textarea testing:
```
This is a test message to verify the auto-resize functionality.
Line 2: The textarea should expand as more content is added.
Line 3: We want to see smooth transitions.
Line 4: The maximum height should be 200px.
Line 5: After that, a scrollbar should appear.
Line 6: The scrollbar should be 6px wide.
Line 7: It should have rounded corners.
Line 8: The thumb should be styled with theme colors.
Line 9: Hovering should change the scrollbar color.
Line 10: This should be enough lines to trigger scrolling.
Line 11: Let's add one more for good measure.
```

---

## Test Suite A: Chat Input Auto-Resize

### Test A1: Minimum Height (Initial State)
**Steps:**
1. Navigate to Chat module (click chat icon in sidebar)
2. Locate the message input textarea at the bottom
3. Measure textarea height using DevTools inspector

**Expected Results:**
- ✅ Textarea has minimum height of ~40px
- ✅ Placeholder text visible: "Type a message... (Shift+Enter for new line)"
- ✅ Send button visible on the right (40x40px)

**Screenshot:** `A1-chat-input-initial.png`

---

### Test A2: Auto-Resize on Typing
**Steps:**
1. Click in the textarea to focus
2. Type: "Line 1" and press Shift+Enter
3. Type: "Line 2" and press Shift+Enter
4. Type: "Line 3" and press Shift+Enter
5. Continue adding lines slowly and observe

**Expected Results:**
- ✅ Textarea expands smoothly with each new line
- ✅ Transition animation is smooth (no sudden jumps)
- ✅ Height increases incrementally based on content
- ✅ No layout shift in surrounding elements

**Screenshot:** `A2-chat-input-expanding.png`

---

### Test A3: Maximum Height & Scrollbar
**Steps:**
1. Continue typing or paste the long text sample
2. Observe behavior when content exceeds ~10 lines

**Expected Results:**
- ✅ Textarea stops growing at 200px height
- ✅ Scrollbar appears automatically
- ✅ Scrollbar width is 6px
- ✅ Scrollbar has rounded corners (3px radius)
- ✅ Scrollbar track is dark (matches theme)
- ✅ Scrollbar thumb is lighter, with border

**Screenshot:** `A3-chat-input-scrollbar.png`

---

### Test A4: Scrollbar Interactions
**Steps:**
1. With long text in textarea, hover over scrollbar
2. Drag scrollbar thumb up and down
3. Use mouse wheel to scroll within textarea

**Expected Results:**
- ✅ Scrollbar thumb changes color on hover (to accent color)
- ✅ Scrolling is smooth and responsive
- ✅ Content scrolls correctly inside textarea
- ✅ No page scrolling occurs (scrolling isolated to textarea)

**Screenshot:** `A4-scrollbar-hover.png`

---

### Test A5: Send & Reset
**Steps:**
1. With long text in textarea, click Send button
2. Observe textarea behavior after sending

**Expected Results:**
- ✅ Textarea clears after sending
- ✅ Textarea returns to minimum height (40px)
- ✅ Smooth collapse animation
- ✅ Message appears in chat history

**Screenshot:** `A5-chat-input-reset.png`

---

## Test Suite B: Model Selector

### Test B1: Current Model Display
**Steps:**
1. In Chat module, locate the model selector at the top
2. Read the current selected model

**Expected Results:**
- ✅ Display shows "AI MODEL:" label
- ✅ Icon visible: ⚡
- ✅ Model name: "Sonnet 3.5"
- ✅ Provider badge: "anthropic"
- ✅ Chevron icon on right side

**Screenshot:** `B1-model-selector-closed.png`

---

### Test B2: Open Dropdown
**Steps:**
1. Click on the model selector button
2. Wait for dropdown animation to complete

**Expected Results:**
- ✅ Dropdown opens smoothly
- ✅ Header shows: "Select AI Model" and subtitle
- ✅ All 6 models visible:
  - 🧠 Claude 3.5 Opus (badge: "Most Capable")
  - ⚡ Claude 3.5 Sonnet (badge: "Best Value") ✅ SELECTED
  - 🚀 Claude 3.5 Haiku
  - ✨ Gemini 2.0 Flash (badge: "New")
  - 🌟 Gemini 1.5 Pro (badge: "2M Context")
  - 🤖 GPT-4 Turbo (badge: "OpenAI")
- ✅ No Claude 3.0 models present (CRITICAL)
- ✅ Sonnet 3.5 has checkmark indicator
- ✅ Sonnet 3.5 card has highlight style

**Screenshot:** `B2-model-selector-open.png`

---

### Test B3: Model Card Hover Effects
**Steps:**
1. With dropdown open, hover over each model card
2. Observe animation effects

**Expected Results:**
- ✅ Card background changes on hover
- ✅ Subtle shimmer/shine effect (optional)
- ✅ Smooth transition animation
- ✅ Cursor changes to pointer

**Screenshot:** `B3-model-card-hover.png`

---

### Test B4: Model Selection
**Steps:**
1. Click on "Haiku 3.5" model card
2. Observe dropdown behavior

**Expected Results:**
- ✅ Dropdown closes smoothly
- ✅ Model selector now shows "Haiku 3.5"
- ✅ Icon changed to 🚀
- ✅ Provider badge still shows "anthropic"

**Screenshot:** `B4-model-selected.png`

---

### Test B5: Keyboard Navigation
**Steps:**
1. Tab to model selector button
2. Press Enter to open dropdown
3. Press Escape key

**Expected Results:**
- ✅ Tab focuses the model selector (visible focus ring)
- ✅ Enter opens the dropdown
- ✅ Escape closes the dropdown
- ✅ Focus returns to model selector button

**Screenshot:** `B5-keyboard-focus.png`

---

## Test Suite C: Dashboard Metrics

### Test C1: Dashboard Overview
**Steps:**
1. Navigate to Dashboard (Home) module
2. Scroll to "Métricas Principais" section
3. Identify all 4 metric cards

**Expected Results:**
- ✅ 4 metric cards visible in grid layout
- ✅ Cards: Backlog, Em Progresso, Em Teste, Concluídos
- ✅ Each card has icon, title, and large number value
- ✅ Values using large font (48px / 3rem)

**Screenshot:** `C1-dashboard-overview.png`

---

### Test C2: "Em Progresso" Highlighted Card
**Steps:**
1. Locate the "Em Progresso" (In Progress) card
2. Observe for 5-10 seconds to see animation cycle

**Expected Results:**
- ✅ Card has animated glow effect around border
- ✅ Glow pulses smoothly (2s cycle)
- ✅ Gradient border rotates (3s cycle)
- ✅ Card is slightly larger than others (scale 1.02)
- ✅ Colors: Cyan and purple gradient
- ✅ Card has higher z-index (appears "lifted")

**Screenshot:** `C2-highlighted-card-glow.png`

**Video Recommended:** Record 10s screen capture to show animation

---

### Test C3: Sparkline Mini-Chart
**Steps:**
1. On "Em Progresso" card, look below the metric value
2. Locate the sparkline chart

**Expected Results:**
- ✅ Sparkline visible as small line chart
- ✅ Chart shows trend over 7 data points
- ✅ Line color matches card accent (amber/orange)
- ✅ Chart has proper dimensions (~100px wide, 48px tall)
- ✅ Smooth line rendering (no jagged pixels)

**Screenshot:** `C3-sparkline-chart.png`

---

### Test C4: Card Hover Effects
**Steps:**
1. Hover over each metric card (excluding "Em Progresso")
2. Observe hover animations

**Expected Results:**
- ✅ Card lifts up on hover (translateY -4px)
- ✅ Border color becomes stronger
- ✅ Box shadow increases
- ✅ Icon scales slightly (1.05x)
- ✅ Transitions are smooth
- ✅ "Em Progresso" card also responds to hover (on top of glow)

**Screenshot:** `C4-card-hover.png`

---

### Test C5: Metric Card Icons & Badges
**Steps:**
1. Inspect each card's icon wrapper
2. Check for trend badges (% indicators)

**Expected Results:**
- ✅ Icons have colored backgrounds with gradients
- ✅ Icons have subtle shadow/glow
- ✅ "Em Progresso" card shows:
  - Subtitle: "X impl • Y test • Z review"
  - Trend badge: "+12% vs. semana passada"
  - Trend arrow: ↑ (upward)
  - Trend color: green/success
- ✅ "Concluídos" card shows trend: "+8% últimos 7 dias"

**Screenshot:** `C5-card-details.png`

---

## Test Suite D: Responsive Design

### Test D1: Desktop View (1920px)
**Steps:**
1. Set browser width to 1920px
2. Navigate through Dashboard and Chat
3. Observe layout and spacing

**Expected Results:**
- ✅ Full desktop layout active
- ✅ Cards displayed in grid (likely 4 columns)
- ✅ Chat sidebar full width
- ✅ All elements properly spaced
- ✅ No horizontal scrolling

**Screenshot:** `D1-desktop-1920px.png`

---

### Test D2: Tablet View (768px)
**Steps:**
1. Resize browser to 768px width
2. Navigate through Dashboard and Chat
3. Check for layout changes

**Expected Results:**
- ✅ Cards reflow to 2 columns
- ✅ Font sizes remain readable
- ✅ Spacing adjusted appropriately
- ✅ Chat input still functional

**Screenshot:** `D2-tablet-768px.png`

---

### Test D3: Mobile View (375px)
**Steps:**
1. Resize browser to 375px width (iPhone SE size)
2. Test all interactions on mobile layout

**Expected Results:**

**Chat Input:**
- ✅ Reduced padding (space-3 instead of space-4)
- ✅ Font size: 0.9rem (14.4px)
- ✅ Send button: 36x36px (smaller)
- ✅ Auto-resize still works
- ✅ Scrollbar still appears when needed

**Dashboard:**
- ✅ Cards stack in single column
- ✅ Card padding reduced
- ✅ Metric value font: 1.5rem (24px)
- ✅ Icon wrapper: 32x32px
- ✅ Glow effect still visible on "Em Progresso"
- ✅ All text readable

**Screenshot:** `D3-mobile-375px.png`

---

### Test D4: Mobile Interactions
**Steps:**
1. At 375px width, tap chat input
2. Tap model selector
3. Tap metric cards

**Expected Results:**
- ✅ No accidental double-taps needed
- ✅ Touch targets large enough (min 44x44px)
- ✅ Dropdowns don't overflow screen
- ✅ Scrolling smooth on mobile
- ✅ No horizontal scrolling

**Screenshot:** `D4-mobile-interactions.png`

---

## Test Suite E: Animations & Performance

### Test E1: Normal Motion (Default)
**Steps:**
1. Ensure "Reduce Motion" is OFF in OS settings
2. Observe all animations on Dashboard and Chat

**Expected Results:**
- ✅ "Em Progresso" glow pulses smoothly
- ✅ Gradient border rotates continuously
- ✅ Chat input expands/collapses smoothly
- ✅ Card hover effects animate
- ✅ Model selector opens/closes with animation
- ✅ All transitions feel smooth (no jank)

**Performance Check (DevTools):**
- ✅ FPS stays above 50fps during animations
- ✅ No layout thrashing warnings
- ✅ No console errors

**Screenshot:** `E1-animations-enabled.png`

---

### Test E2: Reduced Motion Mode
**Steps:**
1. Enable "Reduce Motion" in OS accessibility settings:
   - **macOS:** System Preferences > Accessibility > Display > Reduce motion
   - **Windows:** Settings > Ease of Access > Display > Show animations
   - **Chrome DevTools:** Cmd+Shift+P > "Emulate CSS prefers-reduced-motion"
2. Reload the application
3. Observe animations

**Expected Results:**
- ✅ "Em Progresso" glow animation DISABLED
- ✅ Gradient rotation DISABLED
- ✅ Card hover transform DISABLED (no translateY)
- ✅ All animations respect reduced-motion preference
- ✅ Instant transitions instead of animated
- ✅ Functionality still works (only animations removed)

**Screenshot:** `E2-reduced-motion.png`

---

### Test E3: Performance Profiling
**Steps:**
1. Open Chrome DevTools > Performance tab
2. Click Record
3. Interact with chat input (type long text)
4. Hover over dashboard cards
5. Stop recording after 10 seconds
6. Analyze flame graph

**Expected Results:**
- ✅ No long tasks (>50ms)
- ✅ Smooth 60fps during interactions
- ✅ No forced reflows/layouts
- ✅ Minimal JavaScript execution time
- ✅ CSS animations hardware-accelerated

**Screenshot:** `E3-performance-profile.png`

---

## Test Suite F: Accessibility

### Test F1: Keyboard Navigation - Chat
**Steps:**
1. Click browser address bar, then Tab into page
2. Continue tabbing through Chat module

**Expected Results:**
- ✅ Focus moves through elements in logical order:
  1. Model selector button
  2. Chat history area
  3. Textarea
  4. Send button
- ✅ Visible focus indicators on all elements
- ✅ Focus styles match theme (colored ring/outline)
- ✅ Tab order makes sense

**Screenshot:** `F1-keyboard-nav-chat.png`

---

### Test F2: Keyboard Navigation - Model Selector
**Steps:**
1. Tab to model selector
2. Press Enter to open
3. Try Tab, Arrow keys, Escape

**Expected Results:**
- ✅ Enter opens dropdown
- ✅ Tab cycles through model cards
- ✅ Arrow keys navigate models (if implemented)
- ✅ Escape closes dropdown
- ✅ Focus trapped in dropdown while open

**Screenshot:** `F2-keyboard-nav-models.png`

---

### Test F3: Screen Reader Testing (Optional)
**Steps:**
1. Enable VoiceOver (macOS) or NVDA (Windows)
2. Navigate through Dashboard and Chat
3. Listen to announcements

**Expected Results:**
- ✅ Model selector announces: "Select AI Model, button, expanded"
- ✅ Metric cards announce: "Backlog, 5, heading"
- ✅ Textarea announces: "Type a message, text area"
- ✅ All interactive elements have labels
- ✅ ARIA attributes properly set

**Notes:** Document any unclear or missing announcements

---

### Test F4: Color Contrast
**Steps:**
1. Open DevTools > Lighthouse
2. Run Accessibility audit
3. Check for color contrast issues

**Expected Results:**
- ✅ All text meets WCAG AA standards (4.5:1 for normal text)
- ✅ Large text meets 3:1 ratio
- ✅ UI controls meet 3:1 ratio
- ✅ No contrast failures in audit

**Screenshot:** `F4-lighthouse-accessibility.png`

---

## Test Suite G: Cross-Browser Compatibility

### Test G1: Chrome
**Steps:**
1. Test all above scenarios in Chrome
2. Verify custom scrollbar rendering

**Expected Results:**
- ✅ All features work
- ✅ Custom scrollbar renders correctly
- ✅ Backdrop-filter effects work
- ✅ Animations smooth

**Screenshot:** `G1-chrome-compatibility.png`

---

### Test G2: Firefox
**Steps:**
1. Test all above scenarios in Firefox
2. Check for vendor-specific issues

**Expected Results:**
- ✅ All features work
- ✅ Scrollbar may look different (Firefox uses different API)
- ✅ Fallback styles acceptable
- ✅ Animations smooth

**Screenshot:** `G2-firefox-compatibility.png`

---

### Test G3: Safari
**Steps:**
1. Test all above scenarios in Safari
2. Check for WebKit-specific issues

**Expected Results:**
- ✅ All features work
- ✅ Backdrop-filter requires `-webkit-` prefix (check CSS)
- ✅ Custom scrollbar renders
- ✅ Animations smooth

**Screenshot:** `G3-safari-compatibility.png`

---

## Test Results Summary

After completing all tests, fill out this summary:

| Test Suite | Total Tests | Passed | Failed | Notes |
|------------|-------------|--------|--------|-------|
| A: Chat Input | 5 | ___ | ___ | |
| B: Model Selector | 5 | ___ | ___ | |
| C: Dashboard | 5 | ___ | ___ | |
| D: Responsive | 4 | ___ | ___ | |
| E: Animations | 3 | ___ | ___ | |
| F: Accessibility | 4 | ___ | ___ | |
| G: Cross-Browser | 3 | ___ | ___ | |
| **TOTAL** | **29** | ___ | ___ | |

---

## Issues Template

For any failed tests, document issues using this template:

### Issue #X: [Short Description]
**Severity:** Critical / High / Medium / Low
**Test ID:** [e.g., A3, B2, etc.]
**Browser:** [Chrome / Firefox / Safari / All]
**Viewport:** [Desktop / Tablet / Mobile]

**Description:**
[What went wrong?]

**Expected Behavior:**
[What should happen?]

**Actual Behavior:**
[What actually happened?]

**Steps to Reproduce:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Screenshot:**
[Attach screenshot showing the issue]

**Console Errors:**
```
[Paste any console errors]
```

**Recommendation:**
[Suggested fix]

---

## Sign-Off

**Tester Name:** ___________________________
**Date:** ___________________________
**Time Spent:** _____ minutes
**Overall Result:** PASS / FAIL / PARTIAL

**Summary:**
[Write brief summary of testing session]

**Critical Issues Found:** _____
**Blockers:** _____

**Ready for Production?** YES / NO

**Signature:** ___________________________

---

**Save all screenshots to:** `/Users/eduardo/Documents/youtube/orquestrator-agent/.worktrees/card-4275ede9/test-reports/playwright/2026-01-12_17-39-55/screenshots/`
