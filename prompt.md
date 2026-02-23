Build a professional, minimalistic website for a podology beauty salon (JukaMedical) with the following specifications (only use vanilla js, html, css):
Design Direction:

Minimalistic, clean, and professional aesthetic — think luxury wellness/medical spa
Primary palette: #BCD9A2 (sage green — trust/calm), #FFA6A6 (soft coral — warmth/accent). Background: white or near-white (#FAFAF9 or similar)
Typography: pair a refined serif display font (e.g., Cormorant Garamond, Playfair Display) with a clean geometric sans-serif body font (e.g., Outfit, DM Sans) — no generic system fonts or overused choices like Inter/Roboto
Generous whitespace, subtle transitions, and restrained use of color — let the content breathe

Structure & Sections (in this order):

Sticky Navigation — logo + menu links, stays fixed on top, compact with a mobile hamburger menu
Hero / CTA — bold headline, short tagline, prominent "Book an Appointment" button, optional background image or subtle decorative element
About Us — team section dynamically rendered from JSON data, using a repeatable HTML card template per member. Use a consistent card component that's easy to extend
Services & Prices — clean table or card-based layout dynamically rendered from JSON data, listing treatments with descriptions and prices
Trainings — section dynamically rendered from JSON data, highlighting professional courses/workshops offered by the salon, with brief descriptions and a CTA to inquire
Contact — address, phone, email, working hours, optional embedded map placeholder and a simple contact form
Footer — copyright, social links, repeat nav

Data Layer — JSON Files:
All dynamic content should be loaded from local JSON files via fetch(). Create the following data files with realistic placeholder content:

data/team.json — array of team members, each with:

id, name, role (e.g., "Lead Podologist", "Nail Technician"), bio (short paragraph), photo (placeholder path like images/team/name.jpg), specialties (array of strings), experience (years or short description), socials (object with optional instagram, linkedin, etc.)

data/services.json — array of service categories, each containing:

id, category (e.g., "Medical Podology", "Aesthetic Treatments"), description (short category intro), items array — each item with id, name, description, duration (e.g., "45 min"), price (number), currency (e.g., "EUR"), isPopular (boolean flag for highlighting)

data/trainings.json — array of training programs, each with:

id, title, description, duration (e.g., "2 days / 16 hours"), level (e.g., "Beginner", "Advanced"), price, currency, includes (array of what's included, e.g., "Certificate", "Materials", "Practice session"), nextDate (ISO date string or null), spotsAvailable (number or null), image (placeholder path)

SEO & Accessibility:

Semantic HTML5 elements throughout (<header>, <main>, <section>, <nav>, <footer>, <article>, etc.)
Proper heading hierarchy (h1 only once on the page, logical h2→h3 nesting per section)
Meta tags: description, keywords, author, viewport, Open Graph tags (og:title, og:description, og:image, og:type)
Structured data (JSON-LD) for local business schema (name, address, phone, opening hours, service type)
All images must have descriptive alt attributes; decorative images use alt=""
Meaningful <title> tag with primary keyword (e.g., "PodoEstetic — Professional Podology & Foot Care in [City]")
Use of aria-label attributes on interactive elements (hamburger menu, buttons, links where text isn't self-explanatory)
Canonical URL <link rel="canonical">
Favicons and <link rel="icon"> placeholder

Technical Requirements:

Separate files: index.html, styles.css, script.js
CSS follows BEM methodology (block\_\_element--modifier)
Responsive design (mobile-first approach)
Smooth scrolling behavior for all anchor links

JavaScript — OOP & Maintainability:

Written in OOP style using ES6+ classes
No hardcoded selectors or values — all DOM elements referenced via data-\* attributes or configurable selectors passed as constructor options/config objects. The most important is not to over-engineer things, keep it simple - it should be easy to understand by person with basic-intermediate knowledge of JS, html and css.
Classes should be reusable and self-contained:

DataService — generic class to fetch and cache JSON data from any endpoint
ComponentRenderer — base class or utility for rendering arrays of data into HTML using template functions
SmoothScroll — works on any set of anchor links
MobileNav — can be initialized with any toggle/menu pair
StickyHeader — driven by a scroll threshold parameter
Section-specific renderers (e.g., TeamSection, ServicesSection, TrainingsSection) that extend or use ComponentRenderer and accept their JSON data + a container reference

Use an App initializer class that bootstraps all components — single entry point for the entire application
Methods should be small, single-responsibility, and clearly named
Event listeners should be properly managed (easy to add/remove, no anonymous inline handlers)
Use a config object at the top for any values that might change (selectors, data file paths, class names, breakpoints, animation durations, scroll offsets)
Code should be commented explaining the purpose of each class and public method
