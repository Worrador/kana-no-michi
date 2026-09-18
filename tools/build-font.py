#!/usr/bin/env python3
"""Rebuild assets/css/fonts.css: subset Noto Serif JP to the characters the game
actually renders, then inline it as a data URI.

Run after adding new Japanese text to any data file or to index.html.

    pip install fonttools brotli
    python tools/build-font.py

The source font is Noto Serif JP (SIL Open Font License 1.1). It is downloaded on
demand rather than committed, since only the subset is needed at runtime.
"""
import base64, glob, io, os, subprocess, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_URL = ('https://raw.githubusercontent.com/notofonts/noto-cjk/main/'
           'Serif/SubsetOTF/JP/NotoSerifJP-Regular.otf')
SUBSET = os.path.join(ROOT, 'assets', 'fonts', 'NotoSerifJP-Regular.subset.woff2')
OUT = os.path.join(ROOT, 'assets', 'css', 'fonts.css')

RANGE = 'U+2000-206F, U+3000-303F, U+3040-309F, U+30A0-30FF, U+4E00-9FFF, U+FF00-FFEF'


def charset():
    """Every non-Latin character appearing anywhere in the game."""
    chars = set()
    files = ([os.path.join(ROOT, 'index.html')] +
             glob.glob(os.path.join(ROOT, 'assets', 'js', '*.js')) +
             glob.glob(os.path.join(ROOT, 'assets', 'js', 'data', '*.js')) +
             glob.glob(os.path.join(ROOT, 'assets', 'css', 'style.css')))
    for f in files:
        for ch in io.open(f, encoding='utf-8').read():
            if ord(ch) > 0x2000:
                chars.add(ch)
    chars |= set('、。「」・ー゛゜々〜：；！？（）　')
    chars |= set(chr(c) for c in range(0x20, 0x7F))
    return ''.join(sorted(chars))


def main():
    text = charset()
    print('characters in use:', len(text))

    src = os.path.join(ROOT, 'assets', 'fonts', 'NotoSerifJP-Regular.otf')
    if not os.path.exists(src):
        print('downloading Noto Serif JP ...')
        urllib.request.urlretrieve(SRC_URL, src)

    listing = os.path.join(ROOT, '.charset.txt')
    io.open(listing, 'w', encoding='utf-8').write(text)
    subprocess.check_call([
        sys.executable, '-m', 'fontTools.subset', src,
        '--text-file=' + listing,
        '--output-file=' + SUBSET,
        '--flavor=woff2',
        '--layout-features=kern,palt,vert,vrt2,liga',
        '--desubroutinize', '--no-hinting', '--notdef-outline',
    ])
    os.remove(listing)
    print('subset:', os.path.getsize(SUBSET) // 1024, 'KB')

    b64 = base64.b64encode(open(SUBSET, 'rb').read()).decode('ascii')
    header = io.open(OUT, encoding='utf-8').read().split('@font-face')[0]
    io.open(OUT, 'w', encoding='utf-8').write(
        header +
        '@font-face {\n'
        '  font-family: "Noto Serif JP Subset";\n'
        '  src: url("data:font/woff2;base64,%s") format("woff2");\n'
        '  font-weight: 400 700;\n'
        '  font-style: normal;\n'
        '  font-display: swap;\n'
        '  unicode-range: %s;\n}\n' % (b64, RANGE))
    print('wrote', OUT, os.path.getsize(OUT) // 1024, 'KB')


if __name__ == '__main__':
    main()
