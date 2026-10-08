import os
import re

filepath = 'frontend/src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Ribbon Panel 1 Vol -> [OK]
content = re.sub(
    r"<span>Vol:</span>\s*<span className=\"text-accent-mint font-bold\">\{overview \? '\[OK\]' : '\[LOADING\]'\}</span>",
    r"<span>Records:</span>\n              <span className=\"text-accent-mint font-bold\">{overview ? '100% INDEXED' : '...'}</span>",
    content
)

# Ribbon Panel 2 Status -> [CRITICAL_TRACKING]
content = re.sub(
    r"<span>Status:</span>\s*<span className=\"text-accent-amber font-bold\">\{overview \? '\[CRITICAL_TRACKING\]' : '\.\.\.'\}</span>",
    r"<span>Status:</span>\n              <span className=\"text-accent-amber font-bold\">{overview?.avg_deception_gap ? (overview.avg_deception_gap > 10 ? '[ELEVATED]' : '[NOMINAL]') : '...'}</span>",
    content
)

# Ribbon Panel 4 Sys Health -> [TRACKING]
content = re.sub(
    r"<span>Sys Health:</span>\s*<span className=\"text-accent-mint font-bold\">\{overview \? '\[TRACKING\]' : '\.\.\.'\}</span>",
    r"<span>Mean Quality:</span>\n              <span className=\"text-accent-mint font-bold\">{overview?.avg_code_quality != null ? overview.avg_code_quality.toFixed(1) : '...'}</span>",
    content
)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
