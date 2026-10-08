filepath = 'frontend/src/types/api.ts'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("[groupKey: string]: string | number | null | undefined;", "[groupKey: string]: string | number | boolean | null | undefined;")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
