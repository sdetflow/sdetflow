from __future__ import annotations
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse

root = Path(sys.argv[1]).resolve()
errors: list[str] = []

class Parser(HTMLParser):
    def __init__(self, file: Path):
        super().__init__()
        self.file = file
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if tag == 'a' and 'href' in d:
            href = d['href']
            if href.startswith(('#', 'mailto:', 'https://', 'http://')):
                return
            target = (self.file.parent / href.split('#')[0]).resolve()
            if not target.exists():
                errors.append(f'{self.file.name}: missing local link target {href}')
        if tag == 'link' and d.get('rel') == 'stylesheet' and 'href' in d:
            target = (self.file.parent / d['href']).resolve()
            if not target.exists(): errors.append(f'{self.file.name}: missing stylesheet {d["href"]}')

for html in root.glob('*.html'):
    parser = Parser(html)
    parser.feed(html.read_text(encoding='utf-8'))

index = (root / 'index.html').read_text(encoding='utf-8')
required = [
    'Sumanth Gumedelli',
    'GenAI-powered quality engineering tools',
    'sumantthh@gmail.com',
    'https://sdetflow.github.io/sdetflow/',
    'index,follow',
]
for item in required:
    if item not in index: errors.append(f'index.html missing required production content: {item}')

if errors:
    for error in errors: print('ERROR:', error)
    sys.exit(1)
print('website checks: ok')
