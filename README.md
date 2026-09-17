# Yevhen Boiko — Portfolio

An English portfolio for a Solution Architect and hands-on engineering leader.
Six complete portfolio pages, a separate motion lab, local CV downloads, and
small JavaScript enhancements.
No framework, external fonts, analytics, or server-side services are required.
The ready-to-publish pages are included. Python is only needed to rebuild after
editing their shared source templates.

## Open the site

Open `index.html` in a browser after extracting the entire ZIP. Keep all files
and folders together. Navigation, case-study expansions, and CV downloads work
without JavaScript; the illustrations are progressively enhanced. Open
`motion-lab.html` to compare all three motion prototypes.

Русская инструкция по публикации: [PUBLISH_RU.md](PUBLISH_RU.md).

```text
index.html
scaleglide.html
cor-finance.html
oxydial.html
experience.html
404.html
motion-lab.html       three interactive motion prototypes
styles.css
pages.css
motion.css
cat.css              articulated SVG animation
script.js
cat.js               cat interactions and pause/visibility controls
motion-model.js      timeline and workflow state
motion.js            animation, controls, and prototype interactions
.nojekyll
sitemap.xml
robots.txt
site.json
assets/
  Yevhen_Boiko_CV.pdf
  Yevhen_Boiko_CV.docx
  python-logo.svg
  nodejs-logo.svg
  ruby-logo.png
  ruby-logo-license.txt
src/                 editable content and shared template
  cat.svg            original vector character, separate moving parts
  cat-sleeping.svg   reclining cat at the contact boundary
tools/
  build.py           regenerate the static pages
  check.py           validate files, links, anchors, and metadata
  check-motion.cjs   verify timing and request recovery behavior
README.md
ASSETS.md            image and logo provenance
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
- **Animated workflow in ScaleGlide:** `src/workflow.html`,
  `src/motion-scene.html`, `motion.css`,
  `motion-model.js`, and `motion.js`.
- **SVG cats:** `src/cat.svg`, `src/cat-sleeping.svg`, `cat.css`, and `cat.js`.
- **Technology icons near the introduction:** `src/tech-icons.html` and
  `.hero-stack` in `motion.css`.
- **Three motion prototypes:** `src/motion-lab.html`. This review page has
  `noindex` metadata and is excluded from the sitemap.
- **CV files:** replace the two files in `assets/`, preserving their names or
  updating the source links.
- **Browser-tab icon:** the SVG data URL in `src/template.html`.

After editing source content, rebuild and check from the repository root:

```sh
python tools/build.py
python tools/check.py
node tools/check-motion.cjs
```

Python 3.9+ is sufficient; both scripts use only the standard library. On Windows
you can use `py` instead of `python`; on some systems the command is `python3`.
The optional motion check needs Node.js 18+ and no additional packages.
The generated root HTML files can also be edited directly for a quick change,
but rebuilding will replace those changes. Keep lasting edits in `src/`.

The navigation uses anchors and the case-study expansions use native `<details>`
elements. Both work without JavaScript. There is a skip link, visible keyboard
focus, reduced-motion support, a print stylesheet, and responsive layouts down
to small phones. The layout avoids fixed-height text containers.

## Motion

The animated workflow replaces the old static diagram in both the homepage's
ScaleGlide case and its full case-study page. It plays one ten-second cycle when
it first enters view. One branch retries while completed branches keep their
results. It remains a local illustration and makes no AI/backend requests.

- **Pause / Resume:** retain the current position.
- **Restart / Replay:** begin a new cycle.
- **Calm mode:** advance through static stages using Next step.
- **Reduced motion:** respect the device preference, with no autoplay.
- **Visibility:** pause outside the viewport or in a hidden browser tab.

The homepage has a small original SVG cat beside the project index. Separate
head, eyes, ears, paw, tail, and torso groups animate continuously using CSS;
state changes use eased transitions. Its sky-blue eyes follow the cursor across
the visible viewport, with small, smoothed eye and head movements. Pointer work
is coalesced to one update per animation frame and stops while the cat is hidden
or paused. Click to wave. Pause cat freezes its idle animations. Offscreen/hidden cats
pause automatically, and the device's reduced-motion setting is respected.
Without JavaScript, the cat is a static vector illustration.

A second SVG cat lies at the top edge of the contact section with one forepaw
hanging over the boundary. It only breathes slowly, does not track the cursor,
and has its own pause control. A pale paw outline keeps it visible on the dark
contact background. Its size adapts to narrow screens.

The undated “Your team next?” entry comes before current work in the homepage
timeline and the full Experience page. It links to that page's contact section.

Python, Node.js, and Ruby appear below the homepage introduction and actions.
Their icons respond to hover, keyboard focus, and tap. `motion-lab.html` keeps
the separate comparisons, including all six cat states and the workflow with
the cat. The previous raster pose atlas is no longer used. See `ASSETS.md` for
source and attribution details.

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

The delivery checks cover all seven pages, cross-page links, local assets, anchor
and ARIA targets, unique titles, metadata, JavaScript syntax, CSS block structure,
the sitemap, selected text contrast colors, and ZIP contents. Motion model
checks cover pause/resume, replay, long-frame recovery, completed-branch
retention, output ordering, and path endpoints. Actual visual
rendering and mobile browser behavior have not been verified in a browser in
this environment; review the page in your browser before publishing it.

Suggested quick review: desktop, a narrow phone viewport, 200% text zoom,
keyboard Tab/Enter/Space navigation, all three case-study expansions, workflow
motion controls, cat pause/greeting, all three technology icons, reduced-motion
settings, prototype tabs, all case-study
links, and both CV downloads.

The separate single-file HTML deliverable is an offline review copy containing
all pages, images, and both CV files. It uses a small hash router so those pages can be
reviewed from one file without a server. Upload the contents of the ZIP to GitHub
Pages; the actual published pages are ordinary HTML documents with normal links.
The separate motion-prototypes HTML opens the comparison page first and also
contains a link to the complete working site within that same file.
