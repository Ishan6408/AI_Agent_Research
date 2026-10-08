import os
import re

for root, _, files in os.walk('frontend/src'):
    for f in files:
        if f.endswith('.tsx') or f.endswith('.ts'):
            filepath = os.path.join(root, f)
            with open(filepath, 'r', encoding='utf-8') as f_in:
                content = f_in.read()
                if 'data={[' in content or 'data={ [' in content:
                    print(f"Hardcoded data array found in {filepath}")
                # check for hardcoded names
                if 'Qwen' in content or 'Llama' in content or 'GPT' in content:
                    print(f"Model name found in {filepath}")
