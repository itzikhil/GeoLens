export function AdminSettings() {
  const configSections = [
    {
      title: 'API Keys & Credentials',
      description: 'Configure API keys for external source integrations. Keys are stored securely in Cloud secrets.',
      items: [
        { label: 'News API Key', placeholder: 'Add via Cloud Secrets', configured: false },
        { label: 'YouTube Data API Key', placeholder: 'Add via Cloud Secrets', configured: false },
        { label: 'X/Twitter Bearer Token', placeholder: 'Add via Cloud Secrets', configured: false },
        { label: 'Telegram Bot Token', placeholder: 'Add via Cloud Secrets', configured: false },
      ],
    },
    {
      title: 'Enrichment Pipeline',
      description: 'Configure the item processing pipeline. AI enrichment requires an LLM API key.',
      items: [
        { label: 'LLM API Key (OpenAI / Anthropic)', placeholder: 'Add via Cloud Secrets', configured: false },
        { label: 'Auto-summarize new items', placeholder: 'Enabled when LLM key configured', configured: false },
        { label: 'Auto-cluster items', placeholder: 'Enabled', configured: true },
        { label: 'Deduplication threshold', placeholder: '0.85', configured: true },
      ],
    },
    {
      title: 'Ingestion Schedule',
      description: 'Configure how often sources are polled for new content.',
      items: [
        { label: 'RSS poll interval', placeholder: '15 minutes', configured: true },
        { label: 'API poll interval', placeholder: '30 minutes', configured: true },
        { label: 'Social media poll interval', placeholder: '60 minutes', configured: true },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {configSections.map((section) => (
        <div key={section.title} className="intel-card space-y-3">
          <div>
            <h3 className="font-semibold text-sm">{section.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{section.description}</p>
          </div>
          <div className="space-y-2">
            {section.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                <span className="text-sm">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">{item.placeholder}</span>
                  <div className={`w-2 h-2 rounded-full ${item.configured ? 'bg-signal-active' : 'bg-signal-cooled'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
