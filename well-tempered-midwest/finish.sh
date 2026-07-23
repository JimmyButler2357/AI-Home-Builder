#!/usr/bin/env bash
# Complete the illustrated edition once Wikimedia Commons is reachable.
#
# Prerequisite: run this in an environment whose network policy permits
# outbound HTTPS to *.wikimedia.org (e.g. a Claude Code on the web session
# started with the "No network restrictions" policy, or a custom allowlist
# that includes wikimedia.org). In a blocked session commons_fetch.py will
# simply log each photo as failed and build.py falls back to placeholders.
set -euo pipefail
cd "$(dirname "$0")"

python3 -m pip install --quiet python-docx matplotlib Pillow requests

python3 schematics.py       # Figs 12 & 13 (always local)
python3 commons_fetch.py    # Figs 1-11, 14 (needs *.wikimedia.org)
python3 build.py            # assemble DOCX + PDF proof, verify prose

echo
echo "Done. Review build_log.txt, then the-well-tempered-midwest.docx / .pdf"
