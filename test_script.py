import os
import re

for root, _, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as f_in:
                for i, line in enumerate(f_in):
                    if re.search(r'\[MOCK|\[SIMULATED|SYS_ID|0x[0-9a-fA-F]+|12ms|99\.9|84\.6|72\.8|18\.4|1428|Qwen|fake|mock|\?\? 100|\|\| .N/A.', line, re.IGNORECASE):
                        print(f"{filepath}:{i+1}: {line.strip()}")
