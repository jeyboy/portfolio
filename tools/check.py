"""Check the built site's files and links without third-party packages."""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
BASE = urlsplit(json.loads((ROOT / 'site.json').read_text(encoding='utf-8'))['url'].rstrip('/') + '/')


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True)
        self.ids, self.references, self.aria = [], [], []
        self.h1 = self.main = 0
        self.title, self.in_title = '', False
        self.description = self.canonical = ''
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if 'id' in values:
            self.ids.append(values['id'])
        for key in ('href', 'src'):
            if values.get(key):
                self.references.append(values[key])
        for key in ('aria-labelledby', 'aria-controls'):
            self.aria.extend(values.get(key, '').split())
        self.h1 += tag == 'h1'
        self.main += tag == 'main'
        if tag == 'title':
            self.in_title = True
        if tag == 'meta' and values.get('name') == 'description':
            self.description = values.get('content', '')
        if tag == 'link' and values.get('rel') == 'canonical':
            self.canonical = values.get('href', '')
        if tag == 'a' and values.get('target') == '_blank':
            assert 'noopener' in values.get('rel', ''), 'External link lacks noopener'

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False

    def handle_data(self, text):
        if self.in_title:
            self.title += text


pages = {path.name: Page(path.read_text(encoding='utf-8')) for path in ROOT.glob('*.html')}
assert len(pages) == 6, f'Expected six built pages; got {len(pages)}'
checked = 0
for name, page in pages.items():
    assert page.h1 == page.main == 1, f'{name}: expected one h1 and one main'
    assert page.title and page.description and page.canonical, f'{name}: missing metadata'
    duplicates = [key for key, count in Counter(page.ids).items() if count > 1]
    assert not duplicates, f'{name}: duplicate IDs {duplicates}'
    assert set(page.aria).issubset(page.ids), f'{name}: broken ARIA references'
    for reference in page.references:
        part = urlsplit(reference)
        if part.scheme or part.netloc:
            if (part.scheme, part.netloc) != (BASE.scheme, BASE.netloc):
                continue
            assert part.path.startswith(BASE.path), f'{name}: internal URL outside configured root'
            path = unquote(part.path[len(BASE.path):]) or 'index.html'
        else:
            path = unquote(part.path) or name
        target = (ROOT / path).resolve()
        assert target.is_relative_to(ROOT), f'{name}: unexpected path {reference}'
        assert target.is_file(), f'{name}: missing target {reference}'
        if part.fragment and target.suffix == '.html':
            assert part.fragment in pages[target.name].ids, f'{name}: broken anchor {reference}'
        checked += 1

assert len({page.title for page in pages.values()}) == len(pages), 'Duplicate page titles'
for path in ROOT.glob('*.css'):
    css = path.read_text(encoding='utf-8')
    css = re.sub(r'/\*.*?\*/|"(?:\\.|[^"\\])*"|\'(?:\\.|[^\'\\])*\'', '', css, flags=re.S)
    depth = 0
    for char in css:
        if char == '{':
            depth += 1
        elif char == '}':
            depth -= 1
        assert depth >= 0, f'{path.name}: unexpected closing brace'
    assert depth == 0, f'{path.name}: unclosed CSS block'

sitemap = ET.parse(ROOT / 'sitemap.xml')
urls = [node.text for node in sitemap.findall('.//{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(urls) == 5
assert not any(url.endswith('404.html') for url in urls)
assert (ROOT / '.nojekyll').is_file()
print(json.dumps({'pages': len(pages), 'local_links_and_assets_checked': checked,
                  'unique_titles': True, 'anchor_and_aria_targets': 'valid',
                  'css_block_structure': 'valid', 'sitemap_pages': len(urls)}, indent=2))
