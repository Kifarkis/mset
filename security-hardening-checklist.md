# MSET Security Hardening Checklist

Two layers of follow-up security work for `mset.se` — mostly clicks in external dashboards, one small HTML edit.

---

## Layer 3 — GitHub repo hardening

**Where:** `https://github.com/Kifarkis/mset/settings`

### 3.1 Branch protection (prevents accidental force-push / unreviewed changes)
Navigate to: **Settings → Branches → Branch protection rules → Add rule**

Rule name pattern: `main`

Check the following:
- [ ] **Require a pull request before merging**
  - [ ] Require approvals (set to `1`)
  - [ ] Dismiss stale pull request approvals when new commits are pushed
- [ ] **Require status checks to pass before merging** (if you have CI — skip if not)
- [ ] **Require conversation resolution before merging**
- [ ] **Require linear history** *(optional — prevents merge commits, enforces rebase)*
- [ ] **Do not allow bypassing the above settings** *(applies even to admins — recommended)*
- [ ] **Restrict who can push to matching branches** (leave unchecked unless you have a team)

Uncheck (explicitly dangerous on main):
- [ ] Allow force pushes → OFF
- [ ] Allow deletions → OFF

---

### 3.2 Disable unused repository features
Navigate to: **Settings → General → Features**

Uncheck anything you don't actively use — each one is a potential surface:
- [ ] **Wikis** — OFF (you don't use this)
- [ ] **Issues** — keep ON if you track to-dos in GitHub, otherwise OFF
- [ ] **Sponsorships** — OFF
- [ ] **Preserve this repository** — OFF (enables Arctic Code Vault inclusion — not needed for private consulting code)
- [ ] **Discussions** — OFF
- [ ] **Projects** — OFF unless you actively use them

---

### 3.3 Secret scanning + push protection
Navigate to: **Settings → Code security and analysis**

- [ ] **Secret scanning** → **Enable**
  - [ ] **Push protection** → **Enable** (blocks pushes that contain detected secrets like API keys, Formspree IDs leaked in commits, etc.)
- [ ] **Dependabot alerts** → **Enable**
- [ ] **Dependabot security updates** → **Enable** (auto-PRs for vulnerable dependencies)
- [ ] **Dependabot version updates** → **Enable** (optional — creates regular update PRs)

> Note: Secret scanning is free on public repos. If repo is private, it requires GitHub Advanced Security — otherwise skip this sub-step. Dependabot alerts/updates are free on both.

---

### 3.4 Two-factor authentication
Navigate to: `https://github.com/settings/security`

- [ ] **2FA enabled on your account** (hardware key or authenticator app, not SMS)
- [ ] **Recovery codes saved offline**

---

## Layer 5 — Formspree lockdown

**Where:** `https://formspree.io/forms/xwvalvkj` (your form's settings page)

### 5.1 Allowed domains
Navigate to: **Settings → Security → Allowed domains**

- [ ] Set allowed domain = `mset.se`
- [ ] Set allowed domain = `www.mset.se` (if you use both)
- [ ] **Remove any `*` / localhost / other allowlist entries** that were needed during setup

This means submissions from other domains (e.g., a bot scraping your form action URL and posting from their own server) get rejected.

---

### 5.2 Email validation
Navigate to: **Settings → Validation**

- [ ] Turn on **Email validation** (rejects obviously invalid addresses before delivery)

---

### 5.3 reCAPTCHA
Navigate to: **Settings → Spam protection**

- [ ] Enable **reCAPTCHA v2 / v3** (Formspree injects it — no HTML changes needed on your end)

---

### 5.4 Honeypot field (HTML edit — see below)
Formspree treats any submission where the field `_gotcha` has a value as spam. Bots blindly fill every field they find; humans never see the hidden field.

- [ ] See Appendix below for the one-line HTML edit to add a `_gotcha` field to the form.

---

### 5.5 Auto-responder
Navigate to: **Settings → Auto-Responder**

- [ ] Enable auto-responder to the submitter's email
- [ ] Subject: something like `We received your message — MSET`
- [ ] Body: brief confirmation, including expected response time and contact fallback email (`info@mset.se`)
- [ ] From: your verified `info@mset.se` address (Formspree needs DKIM-style domain verification for this — optional, set up in **Settings → Sending**)

Draft body:

```
Hi {{ first_name }},

Thanks for reaching out. We've received your message and a member
of the MSET team will get back to you within one business day.

If this is urgent, you can also reach us directly at info@mset.se.

— MSET · Kifarkis Nätsäkerhet
```

---

### 5.6 Submission rate limits
Navigate to: **Settings → Security**

- [ ] Set a sensible per-IP rate limit (default Formspree limit is often fine — verify it's active)

---

## Appendix A — Honeypot HTML edit

Add the following hidden input inside your `<form>` tag in `index.html`. Place it near the top of the form (just after the `<form>` opening tag works). Formspree handles the rest.

```html
<!-- Honeypot: bots fill this, humans don't see it. Formspree marks submissions as spam if this field has any value. -->
<input type="text" name="_gotcha" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px;opacity:0;pointer-events:none">
```

Notes on the implementation:
- `position:absolute;left:-9999px` puts it off-screen — invisible to users with CSS on
- `opacity:0` — invisible in case CSS failure reveals positioning
- `pointer-events:none` — unclickable even if visible
- `tabindex="-1"` — keyboard users skip over it
- `aria-hidden="true"` — screen readers skip over it
- `autocomplete="off"` — password managers don't auto-fill it

---

## Priority order

If you're time-limited, do these **first** (biggest blast-radius reduction per minute spent):

1. **5.1 Allowed domains** — stops the most common form-abuse pattern (5 minutes)
2. **5.3 reCAPTCHA** — stops bulk bots (5 minutes)
3. **3.3 Secret scanning + Dependabot** — stops the most common supply-chain & leaked-credential failures (10 minutes)
4. **3.1 Branch protection** — stops accidental production damage (5 minutes)
5. **5.4 Honeypot** — easy belt-and-braces addition (2 minutes + HTML edit)
6. **3.4 2FA** — if you don't have it already on your GitHub account

Everything else is tidying.

---

*Document generated: 2026-04-21*
