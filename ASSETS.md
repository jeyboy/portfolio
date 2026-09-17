# Visual assets

## Portfolio cat

`src/cat.svg` is an original hand-drawn vector character made for this portfolio
at the author's explicit request. It is embedded inline in the generated pages.
`cat.css` animates its separate torso, head, eyes, ears, paw, and tail. State
changes use eased transforms and opacity transitions; the drawing is never
replaced with a different bitmap. `cat.js` handles viewport-wide gaze, greeting, pause,
visibility, and reduced-motion preferences. No image generation was used for
this vector version. The previous raster atlas has been removed from the site.

The open eyes use sky blue `#8FCFF5`. `src/cat-sleeping.svg` shows the same
character reclining at the contact-section boundary with one outlined forepaw
hanging down. Its torso, shoulder and head share a slow breathing phase while
the supported paws and tail remain still. This cat does not track the cursor.
`src/cat-thinking.svg` uses the same face with a thoughtful pose and a cloud
containing three crossfading vector symbols: diagram, gear and code window.
`src/cat-typing.svg` reuses the face above an original keyboard drawing, with
alternating paw and key movement followed by a resting interval.
All four SVGs use indigo fur and blue accents coordinated with the Indigo Blue CV.

## Technology logos

Original logos are included locally with their colors and proportions preserved.
Motion affects the surrounding ring and the image position.

- Python: [official logo page](https://www.python.org/community/logos/),
  [source SVG](https://s3.dualstack.us-east-2.amazonaws.com/pythondotorg-assets/media/files/python-logo-only.svg).
- Node.js: [official branding page](https://nodejs.org/en/about/branding),
  [source SVG](https://nodejs.org/static/logos/nodejsHex.svg).
- Ruby: [official logo page](https://www.ruby-lang.org/en/about/logo/),
  [official logo kit](https://cache.ruby-lang.org/pub/misc/logo/ruby-logo-kit.zip).
  `ruby-logo.png` is the unchanged `ruby-kit/ruby.png` from that kit, 995 × 996.
  Ruby logo © 2006 Yukihiro Matsumoto,
  [CC BY-SA 2.5](https://creativecommons.org/licenses/by-sa/2.5/).
  The original license is preserved in `assets/ruby-logo-license.txt`;
  attribution is also included in the page footer.

The logos identify technologies in the portfolio; no affiliation or endorsement
is implied. Their respective trademark terms continue to apply.

## Diagram

The workflow is a custom HTML/SVG illustration of the confirmed request-level
recovery behavior. It replaces the previous static scheme in the homepage's
ScaleGlide section and its detailed case study. Branch states and timing are
illustrative, not production telemetry.
