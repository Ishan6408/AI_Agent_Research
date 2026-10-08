filepath = 'frontend/src/pages/Dashboard.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("key={tier.pressure || idx}", "key={String(tier.pressure || idx)}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
