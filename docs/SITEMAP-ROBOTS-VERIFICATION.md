Hypnate Sitemap & Robots Verification

Date: 20 September 2026



Indexed public routes

The sitemap contains only the current public marketing/legal surface:

/

/features

/pricing

/about

/faq

/careers

/contact

/terms

/privacy

/refund

These are emitted as absolute https://hypnate.in/... URLs.




Excluded from indexing

The robots policy disallows the auth and application areas:

/login

/signup

/verify-email

/forgot-password

/onboarding

/dashboard

/products

/orders

/customers

/conversations

/settings

/payments

/analytics

/hypnate-x

Product sub-routes such as /products/:id and /orders/:id are covered by the parent-path Disallow rules.

Verification

public/sitemap.xml is valid XML and is copied to /sitemap.xml by the Create React App public directory build behavior.

public/robots.txt is copied to /robots.txt by the same build behavior.

robots.txt uses Allow: /, so the public site is not accidentally blocked.

The sitemap is referenced from robots.txt using the canonical production origin.

No auth/private route is included in the sitemap.

Live deployment check

A direct external fetch of https://hypnate.in/sitemap.xml and https://hypnate.in/robots.txt was not independently available in the current verification environment. Therefore source/deployment configuration is verified, but live HTTP 200 status and deployed response headers still need confirmation after deployment.