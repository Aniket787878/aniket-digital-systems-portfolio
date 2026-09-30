#!/usr/bin/env bash
# Installs Crawl4AI, the default web scraper for work on this repo, and puts
# a `crawl` command on PATH (see scripts/crawl.py for usage).
#
# Why a virtualenv: the container's Python is Debian-managed, and pip cannot
# upgrade packages it installed (cryptography), so a plain `pip install` fails.
# Why Playwright is pinned: the container ships Chromium build 1194 at
# /opt/pw-browsers and must not download browsers; Playwright 1.56 is the
# release that drives that build (patchright, used by --undetected, is pinned
# to its matching 1.56.0 for the same reason). A newer one looks for a Chromium that is
# not there.
#
# Crawl4AI runs inside the sandbox, so it only reaches hosts the
# environment's network policy allows.
set -euo pipefail
VENV=/opt/crawl4ai-venv
here="$(cd "$(dirname "$0")" && pwd)"
[ -x "$VENV/bin/python" ] || python3 -m venv "$VENV"
"$VENV/bin/pip" install -q --upgrade pip
"$VENV/bin/pip" install -q crawl4ai "playwright==1.56.0" "patchright==1.56.0"
install -m 755 "$here/crawl.py" /usr/local/bin/crawl
echo "crawl4ai ready: crawl <url> [--undetected] [--out FILE] [--raw]"
