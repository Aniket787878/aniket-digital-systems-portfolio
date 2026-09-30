#!/opt/crawl4ai-venv/bin/python
"""Crawl4AI helper: the default web scraper for this environment.

usage: crawl <url> [--undetected] [--out FILE] [--raw]
  Prints the page as clean markdown (fit_markdown when available).
  --undetected  use Crawl4AI's undetected browser adapter, for sites that
                block the normal headless browser. Try the normal mode first.
  --raw         print the full markdown instead of the filtered version.
Routes through the sandbox HTTPS proxy (HTTPS_PROXY) automatically.
"""
import asyncio, os, sys, argparse
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig, CacheMode


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--undetected", action="store_true")
    ap.add_argument("--out")
    ap.add_argument("--raw", action="store_true")
    a = ap.parse_args()

    proxy = os.environ.get("HTTPS_PROXY") or os.environ.get("https_proxy")
    bcfg = dict(headless=True, verbose=False)
    if proxy:
        bcfg["proxy_config"] = {"server": proxy}
    if a.undetected:
        bcfg["enable_stealth"] = True
    browser = BrowserConfig(**bcfg)
    run = CrawlerRunConfig(cache_mode=CacheMode.BYPASS, page_timeout=60000)

    strategy = None
    if a.undetected:
        from crawl4ai import UndetectedAdapter
        from crawl4ai.async_crawler_strategy import AsyncPlaywrightCrawlerStrategy
        strategy = AsyncPlaywrightCrawlerStrategy(browser_config=browser, browser_adapter=UndetectedAdapter())

    kw = {"config": browser}
    if strategy:
        kw["crawler_strategy"] = strategy
    async with AsyncWebCrawler(**kw) as crawler:
        r = await crawler.arun(a.url, config=run)
    if not r.success:
        print(f"crawl failed: {r.error_message}", file=sys.stderr)
        sys.exit(1)
    md = r.markdown
    text = (md.raw_markdown if a.raw or not getattr(md, "fit_markdown", None) else md.fit_markdown) if hasattr(md, "raw_markdown") else str(md)
    if a.out:
        open(a.out, "w").write(text)
        print(f"wrote {a.out} ({len(text)} chars)")
    else:
        print(text)

asyncio.run(main())
