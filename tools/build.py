"""Build the portfolio's static pages. Python 3.9+; standard library only."""
from html import escape
from pathlib import Path
from urllib.parse import urljoin, urlparse
import json
import re

ROOT = Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / 'site.json').read_text(encoding='utf-8'))
BASE = CONFIG['url'].rstrip('/') + '/'
assert urlparse(BASE).scheme in ('http', 'https'), 'Set a full public URL in site.json'

PAGES = {
    'index.html': {
        'source': 'home.html',
        'title': 'Yevhen Boiko — Solution Architect',
        'description': 'Yevhen (Eugene) Boiko — Solution Architect and hands-on engineering leader. Selected work in AI orchestration, business systems, and research software.',
    },
    'scaleglide.html': {
        'source': 'scaleglide.html',
        'title': 'ScaleGlide AI — Workflow Architecture | Yevhen Boiko',
        'description': 'A Node.js workflow DSL for four AI client pilots: branching, cross-model validation, request-level recovery, and faster pilot delivery.',
    },
    'cor-finance.html': {
        'source': 'cor-finance.html',
        'title': 'COR-Software — Finance & ERP Architecture | Yevhen Boiko',
        'description': 'Architecture and delivery of a finance and ERP platform: bank integrations, parsing schemas, duplicate detection, and preview/commit imports.',
    },
    'oxydial.html': {
        'source': 'oxydial.html',
        'title': 'OxyDial — Research Software & Numerical Processing | Yevhen Boiko',
        'description': 'Cloud SaaS delivery and numerical processing for oxygen–hemoglobin equilibrium curve research, with P50/P90 validation and reference comparisons.',
    },
    'experience.html': {
        'source': 'experience.html',
        'title': 'Experience & Technical Background | Yevhen Boiko',
        'description': '15+ years in development, architecture, and engineering leadership. Full experience, selected projects, technical skills, education, and CV downloads.',
    },
    '404.html': {
        'source': '404.html',
        'title': 'Page Not Found | Yevhen Boiko',
        'description': 'This page could not be found. Return to the portfolio of Yevhen Boiko, Solution Architect and hands-on engineering leader.',
    },
}

template = (ROOT / 'src' / 'template.html').read_text(encoding='utf-8')
fragments = {
    key: (ROOT / 'src' / filename).read_text(encoding='utf-8')
    for key, filename in [('WORKFLOW', 'workflow.html'), ('IMPORT_MODEL', 'import-model.html'), ('CONTACT', 'contact.html')]
}
person = {
    '@context': 'https://schema.org', '@type': 'Person',
    'name': CONFIG['name'], 'alternateName': CONFIG['alternate_name'],
    'jobTitle': CONFIG['role'], 'url': BASE,
    'sameAs': [CONFIG['linkedin'], CONFIG['github']],
    'email': 'mailto:' + CONFIG['email'],
}

for filename, metadata in PAGES.items():
    content = (ROOT / 'src' / metadata['source']).read_text(encoding='utf-8')
    for key, value in fragments.items():
        content = content.replace('{{' + key + '}}', value)
    content = content.replace('{{SITE_ROOT}}', escape(BASE, quote=True))
    canonical = BASE if filename == 'index.html' else urljoin(BASE, filename)
    extra_head = ''
    if filename == 'index.html':
        extra_head = '<script type="application/ld+json">' + json.dumps(person, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
    if filename == '404.html':
        extra_head = '<meta name="robots" content="noindex">'
    fields = {
        'TITLE': escape(metadata['title']),
        'DESCRIPTION': escape(metadata['description'], quote=True),
        'CANONICAL': escape(canonical, quote=True),
        'WORK_CURRENT': '' if filename in ('experience.html', '404.html') else ' class="is-active"',
        'EXPERIENCE_CURRENT': ' aria-current="page"' if filename == 'experience.html' else '',
        'CONTENT': content,
        'CONTACT': fragments['CONTACT'],
        'EXTRA_HEAD': extra_head,
    }
    document = template
    for key, value in fields.items():
        document = document.replace('{{' + key + '}}', value)
    if filename == '404.html':
        # A GitHub Pages 404 can be served at an arbitrarily nested URL.
        # Its assets and page links must resolve against the deployment root.
        def make_absolute(match):
            attr, value = match.groups()
            parsed = urlparse(value)
            if parsed.scheme or parsed.netloc or value.startswith('#'):
                return match.group(0)
            return attr + '="' + escape(urljoin(BASE, value), quote=True) + '"'
        document = re.sub(r'(href|src)="([^"]+)"', make_absolute, document)
    assert not re.search(r'\{\{[A-Z_]+\}\}', document), f'Unresolved template value in {filename}'
    (ROOT / filename).write_text(document, encoding='utf-8')

urls = '\n'.join('  <url><loc>' + escape(BASE if filename == 'index.html' else urljoin(BASE, filename)) + '</loc></url>' for filename in PAGES if filename != '404.html')
(ROOT / 'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + '\n</urlset>\n', encoding='utf-8')
(ROOT / 'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: ' + urljoin(BASE, 'sitemap.xml') + '\n', encoding='utf-8')
(ROOT / '.nojekyll').touch()
print(f'Built {len(PAGES)} pages and search metadata for {BASE}')
