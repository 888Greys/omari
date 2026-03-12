# Omari Wallet – Loan Application Prototype

A mobile-first, single-page HTML/CSS/JS prototype of a loan application flow for the **Omari Wallet** product (a member of the Old Mutual Group), designed for the Zimbabwean market.

No frameworks, no build tools, no server required — open any `.html` file directly in a browser.

---

## Flow Overview

```
splash.html  →  1.html  →  2.html  →  login.html  →  otp.html  →  confirm.html  →  processing.html  →  status.html
```

| # | File | Screen | Description |
|---|------|--------|-------------|
| 1 | `splash.html` | Splash / Intro | Branded loading screen. Progress bar animates to 100% (~1.5s) then auto-redirects to Step 1. |
| 2 | `1.html` | Loan Setup | User selects loan amount ($100–$2,000), term (30 / 60 / 90 days), and purpose. Live repayment preview updates as they choose. Data saved to `localStorage`. |
| 3 | `2.html` | Applicant Details | Collects full name, mobile number, National ID, and monthly income. Validates input, saves to `localStorage`, then shows a loading spinner before proceeding. |
| 4 | `login.html` | Wallet PIN Entry | User authenticates with their 4-digit Omari Wallet PIN before the application is submitted. |
| 5 | `otp.html` | OTP Verification | 6-digit one-time code entry with a 2-minute countdown timer, auto-advance between boxes, paste support, and resend capability. After verification, a 10-second processing screen plays. |
| 6 | `confirm.html` | Review & Confirm | Full loan summary (amount, term, fee, repayment, purpose) alongside applicant details. User ticks a final consent checkbox before submitting. |
| 7 | `processing.html` | Submission Animation | Animated step-by-step screen showing: verifying details → encrypting → sending to servers → received (~4 seconds total). |
| 8 | `status.html` | Awaiting Approval | Final screen showing the application reference number, blinking "Awaiting Approval" badge, an application timeline, and share/copy options. |

---

## Features

- **Zero dependencies** — pure HTML, CSS, and vanilla JavaScript
- **Mobile-first responsive** — full-screen edge-to-edge on phones ≤ 519px; centered card layout on tablets/desktops ≥ 520px
- **localStorage state** — loan parameters and applicant data persist across pages without a backend
  - `omariLoan` — `{ amount, fee, feeRate, term, purpose, repay }`
  - `omariSubmittedLoan` — `{ name, mobile, nid, income, ref, … }`
- **Brand consistent** — Omari green (`#4DB848`), dark green (`#1b5e20`), magenta accent (`#b90076`), Old Mutual branding
- **Accessible inputs** — `inputmode="numeric"`, `autocomplete="one-time-code"`, proper label associations
- **Security messaging** — OTP anti-fraud warning, 256-bit encryption badge, terms consent on final step

---

## File Structure

```
Omari/
├── splash.html          # Step 1 – Branded intro / loading screen
├── 1.html               # Step 2 – Loan amount, term & purpose
├── 2.html               # Step 3 – Applicant personal details
├── login.html           # Step 4 – Wallet PIN authentication
├── otp.html             # Step 5 – SMS OTP verification
├── confirm.html         # Step 6 – Full application review & consent
├── processing.html      # Step 7 – Submission animation
├── status.html          # Step 8 – Loan awaiting approval
└── README.md
```

---

## Running Locally

1. Clone or download this folder.
2. Open `splash.html` in any modern browser (Chrome, Edge, Firefox, Safari).
3. The app will progress through all screens automatically.

> **Tip:** Use browser DevTools → Device Toolbar (F12 → Ctrl+Shift+M) and set a mobile device (e.g. iPhone SE, Pixel 5) for the intended experience.

---

## Loan Fee Structure

| Term | Fee Rate | Example on $500 |
|------|----------|-----------------|
| 30 days | 13% | $65 fee → $565 repayable |
| 60 days | 18% | $90 fee → $590 repayable |
| 90 days | 24% | $120 fee → $620 repayable |

---

## Customisation Notes

| What to change | Where |
|----------------|-------|
| Loan amount range | `1.html` — `<input type="range" min="100" max="2000">` |
| Fee rates | `1.html` — `feeRates` object in the `<script>` |
| Loan purposes | `1.html` — `.purpose-grid` buttons |
| OTP timer duration | `otp.html` — `let seconds = 120` |
| Processing screen duration | `processing.html` — `setTimeout(..., 4000)` |
| Post-OTP processing duration | `otp.html` — `const total = 10000` |
| Brand colours | CSS variables in each file's `<style>` block |

---

## Production Considerations

This is a **UI prototype only**. Before deploying to real users:

- Replace `localStorage` with authenticated API calls (REST / GraphQL)
- Validate OTP server-side — never trust client-side OTP acceptance
- Enforce PIN verification against a secure backend
- Add HTTPS / TLS throughout
- Implement proper session tokens and CSRF protection
- Conduct accessibility audit (WCAG 2.1 AA)
- Localise currency and date formats for the ZWL / USD dual-currency environment

---

## Licence

Internal prototype — Old Mutual / Omari Wallet. Not for public distribution.
