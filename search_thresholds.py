import os
import re

for root, _, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as f_in:
                lines = f_in.readlines()
                for i, line in enumerate(lines):
                    # Find thresholds like > 20, < 50, etc.
                    # Exclude typical UI/React/iteration vars
                    if re.search(r'([><=]=?)\s*([0-9]+(?:\.[0-9]+)?)', line):
                        # skip safe visual stuff
                        if re.search(r'(length|size|width|height|opacity|index|margin|padding|domain|% COLORS)', line):
                            continue
                        print(f"{filepath}:{i+1}: {line.strip()}")
