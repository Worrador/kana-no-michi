#!/usr/bin/env python3
"""Build dist/kana-no-michi.html: one file, everything inlined.

The game already has no dependencies and no network calls, but it is still four
stylesheets and scripts resolved against a relative assets/ directory. Anywhere that
directory does not travel with the page — a file shared to a phone, an email
attachment, a content:// URI handed over by a messaging app — the relative paths
resolve to nothing and the browser renders bare HTML.

This inlines the lot into a single document that works wherever it lands.

    python tools/build-single.py
"""
import io, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'dist', 'kana-no-michi.html')


def read(rel):
    with io.open(os.path.join(ROOT, rel), encoding='utf-8') as fh:
        return fh.read()


def main():
    html = read('index.html')

    def css(m):
        href = m.group(1)
        return '<style>\n/* ' + href + ' */\n' + read(href) + '\n</style>'

    def js(m):
        src = m.group(1)
        body = read(src)
        # A closing tag inside a string would end the block early.
        body = body.replace('</script', '<\/script')
        return '<script>\n/* ' + src + ' */\n' + body + '\n</script>'

    html = re.sub(r'<link rel="stylesheet" href="([^"]+)">', css, html)
    html = re.sub(r'<script src="([^"]+)"></script>', js, html)

    left = re.findall(r'(?:href|src)="(assets/[^"]+)"', html)
    if left:
        sys.exit('still referencing external files: ' + ', '.join(left))

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with io.open(OUT, 'w', encoding='utf-8') as fh:
        fh.write(html)
    print('wrote %s — %d KB' % (os.path.relpath(OUT, ROOT), os.path.getsize(OUT) // 1024))


if __name__ == '__main__':
    main()
