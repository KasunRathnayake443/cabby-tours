# 🌿 Cabby Tours — Website

A modern, multilingual tourism website for **Cabby Tours**, a private tour operator based in Sri Lanka. Built with pure HTML, CSS, and vanilla JavaScript. No frameworks, no build tools, no dependencies.

---

## 📁 Project Structure

```
cabby-tours/
│
├── index.html              # Main homepage
├── gallery.html            # Full gallery page
├── tours.html              # Tours listing page
├── about.html              # About us page
│
├── send-mail.php           # Contact form mail handler
├── .env                    # Environment config (mail settings)
├── .htaccess               # Apache config (clean URLs, security)
│
├── style.css               # Global stylesheet
├── main.js                 # Global JavaScript
├── translations.js         # Multi-language translation strings
│
└── source/
    └── img/
        ├── about/          # About section images
        │   ├── sigiriya.jpg
        │   ├── tea.jpg
        │   └── tuk.jpg
        └── ...             # Other local images
```

---

## 🚀 Getting Started (Local Development)

### Requirements

- [Laragon](https://laragon.org/) (includes Apache + PHP 8.0+)
- No Composer, no Node.js, no build step required

### Setup

1. Clone or copy the project into your Laragon `www` folder:
   ```
   C:\laragon\www\cabby-tours\
   ```

2. Start Laragon and make sure **Apache** and **Mail** are enabled:
   - Laragon → Menu → Apache → Start
   - Laragon → Menu → Mail → Enable

3. Visit the site at:
   ```
   http://localhost/cabby-tours/
   ```
   or if you have a virtual host set up:
   ```
   http://cabby-tours.test/
   ```

---

## ✉️ Contact Form — Mail Configuration

The contact form submits to `send-mail.php` which reads mail settings from the `.env` file.

### Local Development (Laragon)

The `.env` file is pre-configured for Laragon's built-in SMTP server:

```env
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_FROM=noreply@cabbytours.lk
MAIL_FROM_NAME=Cabby Tours Website
MAIL_TO=owner@cabbytours.lk
MAIL_TO_NAME=Cabby Tours Owner
```

Sent emails appear in **Laragon → Menu → Mail** (the built-in mail viewer).

### ⚠️ Production / Live Hosting — IMPORTANT

When deploying to a live server you **must** update `.env` with your real mail server details. The Laragon settings will not work on a live host.

Contact your hosting provider for the correct SMTP credentials and update the `.env` file as follows:

```env
# ── UPDATE ALL OF THESE FOR LIVE HOSTING ──

MAIL_HOST=mail.yourdomain.com       # Your hosting SMTP server
MAIL_PORT=587                       # Common ports: 25, 465 (SSL), 587 (TLS)
MAIL_FROM=noreply@cabbytours.lk     # Must be a valid email on your domain
MAIL_FROM_NAME=Cabby Tours Website
MAIL_TO=yourname@gmail.com          # The email address that receives enquiries
MAIL_TO_NAME=Cabby Tours Owner
```

> **Common hosting SMTP settings:**
> | Host Type | SMTP Host | Port |
> |-----------|-----------|------|
> | cPanel hosting | `mail.yourdomain.com` | `587` |
> | Gmail (App Password) | `smtp.gmail.com` | `587` |
> | Outlook / Microsoft | `smtp.office365.com` | `587` |
> | SiteGround | `localhost` | `25` |
> | GoDaddy | `smtpout.secureserver.net` | `465` |

> **Note:** If your hosting uses SMTP authentication (username + password), the current `send-mail.php` uses raw socket SMTP without auth. For authenticated SMTP (required by most live hosts) you will need to add SMTP AUTH support or install PHPMailer via Composer.

---

## 🌐 Languages Supported

The site includes a language switcher (bottom-right corner) supporting:

| Code | Language |
|------|----------|
| `en` | English (default) |
| `ru` | Russian |
| `de` | German |
| `fr` | French |
| `es` | Spanish |

Translation strings are stored in `translations.js`. To add a new language, add a new key block to the `translations` object and add the option to the language switcher in `index.html`.

---

## 📄 Pages

| Page | File | Description |
|------|------|-------------|
| Home | `index.html` | Hero, About, Services, Tours, Testimonials, Gallery preview, Contact |
| Gallery | `gallery.html` | Full masonry photo gallery with filters and lightbox |
| Tours | `tours.html` | Full tours listing (day tours + multi-day) |
| About | `about.html` | Extended about page |

---

## 🎨 Sections (Homepage)

| Section | ID | Description |
|---------|----|-------------|
| Hero Carousel | `#hero` | Full-screen auto-advancing image carousel |
| Who We Are | `#about` | About section with image collage and stats |
| What We Offer | `#services` | 6 service cards grid |
| Tours | `#tours` | Tabbed day tours / multi-day tours |
| Testimonials | `#testimonials` | Infinite loop customer review carousel |
| Gallery | `#gallery` | 6-image masonry preview grid |
| Contact | `#contact` | Contact info + enquiry form |

---

## 🔒 Security

The `.htaccess` file handles:

- ✅ Clean URLs — `.html` and `.php` extensions hidden
- ✅ `.env` file blocked from public access
- ✅ Sensitive file types blocked (`.log`, `.sql`, `.json`, `.sh`, etc.)
- ✅ Directory listing disabled
- ✅ Security headers (XSS, clickjacking, content-type sniffing)
- ✅ GZIP compression enabled
- ✅ Browser caching for images and assets

> **Important:** Never commit your `.env` file to a public Git repository. Add `.env` to your `.gitignore`.

### `.gitignore` recommendation

```
.env
*.log
*.sql
debug-*.php
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|------------|-------|
| HTML5 | Page structure |
| CSS3 (vanilla) | All styling, animations, responsive layout |
| JavaScript (vanilla) | Carousel, lightbox, language switcher, form handling |
| PHP 8.0+ | Contact form mail sending |
| Apache `.htaccess` | Clean URLs, security, caching |

No npm, no Webpack, no React, no jQuery — just clean, fast, dependency-free code.

---

## 📱 Responsive Breakpoints

| Breakpoint | Target |
|------------|--------|
| `1200px` | Large tablets / small desktops |
| `1024px` | Tablets landscape |
| `900px` | Tablets portrait |
| `640px` | Mobile landscape |
| `600px` | Mobile portrait |
| `480px` | Small mobile |
| `380px` | Very small mobile |

---

## 🚢 Deployment Checklist

Before going live, complete this checklist:

- [ ] Update `.env` with live SMTP mail server details
- [ ] Replace all Unsplash placeholder images with real Cabby Tours photos
- [ ] Update phone number `+94 77 123 4567` throughout all files
- [ ] Update email `hello@cabbytours.lk` throughout all files
- [ ] Update WhatsApp link `https://wa.me/94771234567` with real number
- [ ] Add real social media URLs (Facebook, Instagram, TripAdvisor)
- [ ] Replace map placeholder with real Google Maps iframe
- [ ] Update tour prices to reflect real pricing
- [ ] Delete `debug-email.php` from the server
- [ ] Confirm `.env` is not publicly accessible (visit `yourdomain.com/.env` — should return 403)
- [ ] Test contact form end-to-end on the live server
- [ ] Verify all page links work with clean URLs (no `.html` extension)

---

## 👨‍💻 Development Notes

### Adding a new translation key

1. Add the `data-i18n="your.key"` attribute to the HTML element
2. Add the key and its translations to `translations.js` for all 5 languages
3. The `applyTranslations()` function in `main.js` will handle the rest automatically

### Adding a new tour card

Copy an existing `.tour-card` block in `index.html` and update the content. For multi-day tours use the `.tour-card--wide` modifier class. Update the `--card-delay` CSS variable on each card to stagger the reveal animation.

### Image paths

Local images live in `source/img/`. Unsplash URLs are placeholders — replace with optimised local images before going live for best performance.

---



