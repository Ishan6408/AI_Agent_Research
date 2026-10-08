filepath = 'frontend/src/types/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old_id = "  id?: string;\n}"
new_id = "  id?: string;\n  experiment_id?: string;\n  timestamp?: string;\n  model?: string;\n  temperature?: number;\n  seed?: number;\n}"
content = content.replace(old_id, new_id)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
