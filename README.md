# Yevhen Boiko — Portfolio

An English portfolio for a Solution Architect and hands-on engineering leader.
Six complete static pages, local CV downloads, and a small JavaScript enhancement.
No framework, external fonts, analytics, or server-side services are required.
The ready-to-publish pages are included. Python is only needed to rebuild after
editing their shared source templates.

## Open the site

Open `index.html` in a browser after extracting the entire ZIP. Keep all files
and folders together. Navigation, case-study expansions, and CV downloads work
without JavaScript; the retry illustration is progressively enhanced.

Русская инструкция по публикации: [PUBLISH_RU.md](PUBLISH_RU.md).

```text
index.html
scaleglide.html
cor-finance.html
oxydial.html
experience.html
404.html
styles.css
pages.css
script.js
.nojekyll
sitemap.xml
robots.txt
site.json
assets/
  Yevhen_Boiko_CV.pdf
  Yevhen_Boiko_CV.docx
src/                 editable content and shared template
tools/
  build.py           regenerate the static pages
  check.py           validate files, links, anchors, and metadata
README.md
```

## Publish with GitHub Pages

The simplest setup for the `jeyboy` account is a user-site repository named
`jeyboy.github.io`. Check whether that repository already exists before creating
one or changing its contents.

1. Create a public repository named `jeyboy.github.io`, or use an appropriate
   existing repository after reviewing its contents.
2. Put this package's files in the repository root on the `main` branch.
   `index.html` must be directly in that root, not inside another folder.
3. In **Settings → Pages**, choose **Deploy from a branch**, then **main** and
   **/ (root)**. Save the setting.
4. After deployment completes, open `https://jeyboy.github.io/`.

The `.nojekyll` file tells Pages to serve these as static files. If you use GitHub's
web upload and the hidden file is omitted, create an empty `.nojekyll` file in the
repository root. This site does not need a GitHub Actions workflow.

The default publication target in `site.json` is `https://jeyboy.github.io/`.
This is a configuration value, not evidence that the site has been deployed.

For a project repository such as `portfolio`, set `url` in `site.json` to
`https://jeyboy.github.io/portfolio/`, then run `python tools/build.py` before
uploading. Do the same when changing to a custom domain. This updates canonical
URLs, the sitemap, robots.txt, and the 404 page's absolute asset references.
Regular page links and assets use relative paths and also work when opened locally.

Official instructions: [Creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).
GitHub Free supports Pages from public repositories. A new publication can take
up to ten minutes to appear.

## Edit the content

- **Homepage content:** `src/home.html`.
- **Full case studies and experience:** the corresponding files in `src/`.
- **Shared header/footer and metadata markup:** `src/template.html`.
- **Shared diagrams and contact section:** `src/workflow.html`,
  `src/import-model.html`, and `src/contact.html`.
- **Name, links, deployment URL:** `site.json`. Visible contact text lives in the
  contact fragment; update it as well if your contact details change.
- **Colors and homepage layout:** `styles.css`; the palette is in `:root`.
- **Full case-study and experience layouts:** `pages.css`.
- **Retry illustration:** `script.js`. This is a local UI illustration and does
  not call any AI service.
- **CV files:** replace the two files in `assets/`, preserving their names or
  updating the source links.
- **Browser-tab icon:** the SVG data URL in `src/template.html`.

After editing source content, rebuild and check from the repository root:

```sh
python tools/build.py
python tools/check.py
```

Python 3.9+ is sufficient; both scripts use only the standard library. On Windows
you can use `py` instead of `python`; on some systems the command is `python3`.
The generated root HTML files can also be edited directly for a quick change,
but rebuilding will replace those changes. Keep lasting edits in `src/`.

The navigation uses anchors and the case-study expansions use native `<details>`
elements. Both work without JavaScript. There is a skip link, visible keyboard
focus, reduced-motion support, a print stylesheet, and responsive layouts down
to small phones. The layout avoids fixed-height text containers.

## Content notes

Content is based on the supplied CV and confirmed project explanations.

- ScaleGlide's four-to-two-week pilot delivery figure is approximate.
- The workflow graphic is a simplified architecture sketch. Its branch states
  are illustrative, not production telemetry or an interactive product demo.
- COR is described as a private beta. Bank API retrieval is qualified by
  availability, with preview/commit retained for beta validation and fallback.
- Levenberg–Marquardt is presented as an investigated fitting method. OxyDial's
  deployment is described as a research and validation environment. The patent
  reference is to a company-filed application, not a granted patent.
- Contract overlaps and GlenFlow's current assignment status are preserved.
- Private project demonstrations are available by contacting the author.

Before future updates, check role dates and the current project status. No
precise production reliability, cost, or accuracy metrics have been invented.

## Verification

The delivery checks cover all six pages, cross-page links, local assets, anchor
and ARIA targets, unique titles, metadata, JavaScript syntax, CSS block structure,
the sitemap, selected text contrast colors, and ZIP contents. Actual visual
rendering and mobile browser behavior have not been verified in a browser in
this environment; review the page in your browser before publishing it.

Suggested quick review: desktop, a narrow phone viewport, 200% text zoom,
keyboard Tab/Enter/Space navigation, all three case-study expansions, the retry
toggle, all case-study links, and both CV downloads.

The separate single-file HTML deliverable is an offline review copy containing
all pages and both CV files. It uses a small hash router so those pages can be
reviewed from one file without a server. Upload the contents of the ZIP to GitHub
Pages; the actual published pages are ordinary HTML documents with normal links.
