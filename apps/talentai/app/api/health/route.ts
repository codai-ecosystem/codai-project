import { createHealthEndpoint, CommonCapabilities } from '@codai/shared-ui';

// TalentAI specific health configuration
const { GET, HEAD } = createHealthEndpoint({
  serviceName: 'TALENTAI',
  version: '1.0.0',
  defaultPort: '3000',
  capabilities: CommonCapabilities.TALENT_AI,
  systemMetrics: true
});

export { GET, HEAD };
