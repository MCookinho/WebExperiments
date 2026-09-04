#!/usr/bin/env python3
"""Download all books from Gutenberg and save as individual JSON files."""
import json, os, re, sys, time, urllib.request

BOOKS_DIR = os.path.join(os.path.dirname(__file__), "books")
BOOKS_JSON = os.path.join(os.path.dirname(__file__), "books.json")

START_MARKERS = [
    re.compile(r'\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG', re.I),
    re.compile(r'\*\*\*START OF (?:THE|THIS) PROJECT GUTENBERG', re.I),
]
END_MARKERS = [
    re.compile(r'\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG', re.I),
    re.compile(r'\*\*\*END OF (?:THE|THIS) PROJECT GUTENBERG', re.I),
    re.compile(r'End of (?:the )?Project Gutenberg', re.I),
    re.compile(r'END OF (?:THE )?PROJECT GUTENBERG', re.I),
]
CHAPTER_RE = re.compile(r'^(?:CHAPTER|Chapter|PART|Part|BOOK|Book)\s+[IVXLCDM\d]+', re.M)


def fetch_text(book_id):
    url = f"https://www.gutenberg.org/cache/epub/{book_id}/pg{book_id}.txt"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RandomBooks/1.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except Exception as e:
        print(f"  FAIL: {e}")
        return None


def strip_gutenberg(text):
    start = 0
    for m in START_MARKERS:
        match = m.search(text)
        if match:
            start = match.end()
            break
    end = len(text)
    for m in END_MARKERS:
        match = m.search(text)
        if match:
            end = match.start()
            break
    return text[start:end].strip() if start else text[:end].strip()


def parse_chapters(text):
    lines = text.split("\n")
    matches = [(i, l.strip()) for i, l in enumerate(lines) if CHAPTER_RE.match(l.strip())]

    if len(matches) >= 2:
        chapters = []
        for idx, (line_i, title) in enumerate(matches):
            end = matches[idx + 1][0] if idx + 1 < len(matches) else len(lines)
            content = "\n".join(lines[line_i:end]).strip()
            if len(content) > 100:
                chapters.append({"title": title[:120], "content": content})
        return chapters

    chunk_size = 3000
    chunks = []
    full = text
    while full:
        if len(full) <= chunk_size:
            chunks.append({"title": f"Part {len(chunks)+1}", "content": full.strip()})
            break
        split = full.rfind("\n", 0, chunk_size)
        if split < chunk_size * 0.5:
            split = chunk_size
        chunk = full[:split].strip()
        if len(chunk) > 50:
            chunks.append({"title": f"Part {len(chunks)+1}", "content": chunk})
        full = full[split:].lstrip("\n")
    return chunks if chunks else [{"title": "Content", "content": text.strip()}]


def main():
    os.makedirs(BOOKS_DIR, exist_ok=True)
    with open(BOOKS_JSON) as f:
        books = json.load(f)["books"]

    total = len(books)
    ok = 0
    fail = 0
    for i, book in enumerate(books):
        bid = book["id"]
        out = os.path.join(BOOKS_DIR, f"{bid}.json")
        if os.path.exists(out) and os.path.getsize(out) > 100:
            print(f"[{i+1}/{total}] SKIP {bid} (cached)")
            ok += 1
            continue

        print(f"[{i+1}/{total}] {bid} - {book['title'][:50]}...")
        text = fetch_text(bid)
        if not text:
            fail += 1
            continue

        body = strip_gutenberg(text)
        chapters = parse_chapters(body)

        data = {"id": bid, "title": book["title"], "author": book["author"], "chapters": chapters}
        with open(out, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False)

        ok += 1
        time.sleep(0.3)

    print(f"\nDone: {ok} ok, {fail} failed out of {total}")


if __name__ == "__main__":
    main()
