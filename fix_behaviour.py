import os

filepath = 'frontend/src/components/analytics/BehaviourAnalysis.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace("import type { DatasetRecord, GroupAnalysisRow } from '../../types/api';", "import type { DatasetRecord, GroupAnalysisRow, AnalyticsOverview } from '../../types/api';")
content = content.replace("const [dataset, setDataset] = useState<DatasetRecord[]>([]);", "const [dataset, setDataset] = useState<DatasetRecord[]>([]);\n  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);")

content = content.replace("const [datasetRes, personalityRes] = await Promise.all([\n        api.getDataset(),\n        api.getPersonality()\n      ]);", "const [datasetRes, personalityRes, overviewRes] = await Promise.all([\n        api.getDataset(),\n        api.getPersonality(),\n        api.getAnalyticsOverview()\n      ]);")
content = content.replace("setPersonalityData(personalityRes);", "setPersonalityData(personalityRes);\n      setOverview(overviewRes);")

old_avg_gap = "const avgGap = dataset.length ? dataset.reduce((acc, d) => acc + (d.deception_gap || 0), 0) / dataset.length : 0;"
new_avg_gap = "const avgGap = overview?.avg_deception_gap || 0;"
content = content.replace(old_avg_gap, new_avg_gap)

old_critical_count = "const criticalCount = dataset.filter(d => (d.deception_gap || 0) > 20).length;"
new_critical_count = "const criticalCount = dataset.filter(d => d.deception_level === 'CRITICAL_DECEPTION').length;"
content = content.replace(old_critical_count, new_critical_count)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
