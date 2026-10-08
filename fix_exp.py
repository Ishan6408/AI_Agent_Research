filepath = 'frontend/src/pages/ExperimentDetail.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

setup_parameters = """            <div className="space-y-3 text-sm">
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Model</span>
                <span className="text-brand-primary font-medium">{experiment.model || '[NO_DATA]'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Seed</span>
                <span className="text-brand-primary font-medium">{experiment.seed || '[NO_DATA]'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-text-muted text-xs mb-0.5">Timestamp</span>
                <span className="text-brand-primary font-medium">{experiment.timestamp || '[NO_DATA]'}</span>
              </div>
              <div className="flex flex-col">"""

content = content.replace('            <div className="space-y-3 text-sm">\n              <div className="flex flex-col">', setup_parameters)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)
