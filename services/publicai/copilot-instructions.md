# PublicAI Service - Copilot Instructions

## Service Overview

**Civic AI Tools and Public Transparency Platform** - Priority 4 service in the Codai Ecosystem

- **Domain**: publicai.ro
- **Port**: 3009
- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS

## Development Context

This is a civic technology service focused on public transparency and democratic engagement. The service should:

1. **Promote Transparency**: Create tools for government data visualization
2. **Enable Civic Engagement**: Build platforms for public participation
3. **Ensure Accessibility**: Follow WCAG guidelines strictly
4. **Maintain Privacy**: Protect citizen data and privacy rights

## Core Features

### Transparency Tools

- Government data dashboards
- Public spending visualization
- Policy impact analysis
- Open data API endpoints

### Civic Engagement

- Public consultation platforms
- Voting information systems
- Community feedback tools
- Democratic participation interfaces

### Data Analysis

- Government performance metrics
- Public service efficiency tracking
- Budget allocation analysis
- Policy outcome measurement

## Code Style & Patterns

### TypeScript

- Use strict TypeScript configuration
- Define proper interfaces for civic data
- Implement robust error handling
- Use generic types for data visualization

### React/Next.js

- Server-side rendering for SEO
- Static generation for performance
- Accessibility-first component design
- Progressive enhancement approach

### Data Handling

- Secure API integrations
- Data validation and sanitization
- Privacy-preserving analytics
- GDPR/CCPA compliance

## File Organization

```
publicai/
├── app/                 # Next.js App Router
├── components/         # Reusable UI components
│   ├── charts/        # Data visualization components
│   ├── forms/         # Public input forms
│   └── accessibility/ # A11y-focused components
├── lib/               # Utility functions
│   ├── data/          # Data processing utilities
│   └── civic/         # Civic-specific functions
├── types/             # TypeScript definitions
└── public/            # Static assets
```

## API Integration

### Government Data Sources

- Open data portals
- Government APIs
- Public records systems
- Statistical databases

### Security Considerations

- API key management
- Rate limiting
- Data anonymization
- Audit logging

## Accessibility Requirements

- WCAG 2.1 AA compliance minimum
- Screen reader compatibility
- Keyboard navigation support
- High contrast mode
- Multiple language support

## Testing Strategy

- Accessibility testing with axe-core
- Data integrity validation
- User journey testing
- Performance benchmarking

## Deployment Considerations

- Government-grade security
- High availability requirements
- Data backup and recovery
- Compliance documentation

## Civic AI Features

### AI-Powered Analysis

- Sentiment analysis of public feedback
- Trend identification in civic data
- Predictive modeling for public services
- Natural language queries for data

### Ethical AI Guidelines

- Bias detection and mitigation
- Transparent AI decision-making
- Public accountability for AI systems
- Citizen consent for AI processing

---

**Remember**: This service serves the public interest. Prioritize transparency, accessibility, and citizen empowerment in all design and development decisions.
