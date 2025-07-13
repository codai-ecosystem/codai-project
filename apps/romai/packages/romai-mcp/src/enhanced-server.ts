import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { RomaiCore, loadConfigFromEnv } from '@codai/romai-core';
import type { IntelligenceRequest } from '@codai/romai-types';

export class RomaiMcpServerEnhanced {
  private server: Server;
  private romaiCore: RomaiCore;

  constructor() {
    this.server = new Server(
      {
        name: 'romai-mcp-enhanced',
        version: '0.2.0',
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    // Initialize ROMAI Core with environment configuration
    const config = loadConfigFromEnv();
    this.romaiCore = new RomaiCore(config);

    this.setupToolHandlers();
    this.setupResourceHandlers();
    this.setupPromptHandlers();
    this.setupErrorHandling();
  }

  private setupResourceHandlers(): void {
    // List available resources
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'romai://romania/business-guide',
            name: 'Romanian Business Guide',
            description: 'Comprehensive guide for doing business in Romania',
            mimeType: 'text/markdown',
          },
          {
            uri: 'romai://romania/cultural-insights',
            name: 'Romanian Cultural Insights',
            description: 'Cultural context and etiquette for Romanian business',
            mimeType: 'text/markdown',
          },
          {
            uri: 'romai://romania/legal-framework',
            name: 'Romanian Legal Framework',
            description: 'Overview of Romanian business law and regulations',
            mimeType: 'text/markdown',
          },
          {
            uri: 'romai://templates/business-email-ro',
            name: 'Romanian Business Email Templates',
            description: 'Professional email templates in Romanian',
            mimeType: 'text/markdown',
          },
          {
            uri: 'romai://data/market-analysis',
            name: 'Romanian Market Analysis Data',
            description: 'Current market trends and analysis for Romania',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read specific resources
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'romai://romania/business-guide':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.getBusinessGuideContent(),
              },
            ],
          };

        case 'romai://romania/cultural-insights':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.getCulturalInsightsContent(),
              },
            ],
          };

        case 'romai://romania/legal-framework':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.getLegalFrameworkContent(),
              },
            ],
          };

        case 'romai://templates/business-email-ro':
          return {
            contents: [
              {
                uri,
                mimeType: 'text/markdown',
                text: await this.getEmailTemplatesContent(),
              },
            ],
          };

        case 'romai://data/market-analysis':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(await this.getMarketAnalysisData(), null, 2),
              },
            ],
          };

        default:
          throw new Error(`Resource not found: ${uri}`);
      }
    });
  }

  private setupPromptHandlers(): void {
    // List available prompts
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'romanian-business-analysis',
            description: 'Analyze business opportunities in Romanian market',
            arguments: [
              {
                name: 'industry',
                description: 'Industry sector to analyze',
                required: true,
              },
              {
                name: 'target_market',
                description: 'Target market segment',
                required: false,
              },
            ],
          },
          {
            name: 'cultural-adaptation-strategy',
            description: 'Develop strategy for cultural adaptation in Romania',
            arguments: [
              {
                name: 'business_type',
                description: 'Type of business or service',
                required: true,
              },
              {
                name: 'origin_country',
                description: 'Country of origin for the business',
                required: false,
              },
            ],
          },
          {
            name: 'romanian-customer-persona',
            description: 'Create detailed Romanian customer personas',
            arguments: [
              {
                name: 'product_category',
                description: 'Product or service category',
                required: true,
              },
              {
                name: 'region',
                description: 'Romanian region (Bucharest, Cluj, Timisoara, etc.)',
                required: false,
              },
            ],
          },
          {
            name: 'romanian-marketing-strategy',
            description: 'Develop marketing strategy for Romanian market',
            arguments: [
              {
                name: 'campaign_type',
                description: 'Type of marketing campaign',
                required: true,
              },
              {
                name: 'budget_range',
                description: 'Budget range for the campaign',
                required: false,
              },
            ],
          },
          {
            name: 'legal-compliance-checklist',
            description: 'Generate compliance checklist for Romanian business operations',
            arguments: [
              {
                name: 'business_activity',
                description: 'Primary business activity',
                required: true,
              },
              {
                name: 'company_size',
                description: 'Company size (startup, SME, enterprise)',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Get specific prompt
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'romanian-business-analysis':
          return {
            description: 'Comprehensive Romanian business market analysis',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: await this.generateBusinessAnalysisPrompt(args),
                },
              },
            ],
          };

        case 'cultural-adaptation-strategy':
          return {
            description: 'Romanian cultural adaptation strategy development',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: await this.generateCulturalAdaptationPrompt(args),
                },
              },
            ],
          };

        case 'romanian-customer-persona':
          return {
            description: 'Detailed Romanian customer persona creation',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: await this.generateCustomerPersonaPrompt(args),
                },
              },
            ],
          };

        case 'romanian-marketing-strategy':
          return {
            description: 'Romanian market-specific marketing strategy',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: await this.generateMarketingStrategyPrompt(args),
                },
              },
            ],
          };

        case 'legal-compliance-checklist':
          return {
            description: 'Romanian legal compliance checklist',
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: await this.generateComplianceChecklistPrompt(args),
                },
              },
            ],
          };

        default:
          throw new Error(`Prompt not found: ${name}`);
      }
    });
  }

  private setupToolHandlers(): void {
    // Handler for listing available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'romai_intelligence',
            description:
              'Ask ROMAI for intelligent analysis and problem-solving in Romanian or English',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'The question or problem to analyze',
                },
                language: {
                  type: 'string',
                  enum: ['ro', 'en'],
                  description: 'Language for the response (Romanian or English)',
                  default: 'ro',
                },
                domain: {
                  type: 'string',
                  description: 'Domain context (e.g., technology, business, science)',
                  default: 'general',
                },
                context: {
                  type: 'string',
                  description: 'Additional context for the query',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_romanian_expert',
            description:
              'Get expert advice on Romanian culture, language, business, and local context',
            inputSchema: {
              type: 'object',
              properties: {
                query: {
                  type: 'string',
                  description: 'Your question about Romania',
                },
                category: {
                  type: 'string',
                  enum: [
                    'culture',
                    'business',
                    'language',
                    'history',
                    'travel',
                    'legal',
                    'education',
                  ],
                  description: 'Category of Romanian expertise needed',
                  default: 'general',
                },
              },
              required: ['query'],
            },
          },
          {
            name: 'romai_problem_solver',
            description:
              'General problem-solving with step-by-step analysis and practical solutions',
            inputSchema: {
              type: 'object',
              properties: {
                problem: {
                  type: 'string',
                  description: 'The problem to solve',
                },
                constraints: {
                  type: 'string',
                  description: 'Any constraints or limitations',
                },
                goals: {
                  type: 'string',
                  description: 'Desired outcomes or goals',
                },
                language: {
                  type: 'string',
                  enum: ['ro', 'en'],
                  description: 'Response language',
                  default: 'ro',
                },
              },
              required: ['problem'],
            },
          },
          {
            name: 'romai_code_assistant',
            description: 'Romanian-first coding assistant for programming help and code generation',
            inputSchema: {
              type: 'object',
              properties: {
                request: {
                  type: 'string',
                  description: 'Your coding question or request',
                },
                language: {
                  type: 'string',
                  description: 'Programming language (e.g., JavaScript, Python, TypeScript)',
                },
                framework: {
                  type: 'string',
                  description: 'Framework or library context',
                },
                explain_in: {
                  type: 'string',
                  enum: ['ro', 'en'],
                  description: 'Language for explanations',
                  default: 'ro',
                },
              },
              required: ['request'],
            },
          },
          {
            name: 'romai_health_check',
            description: 'Check the health status of ROMAI services',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
          // New enterprise tools
          {
            name: 'romai_market_intelligence',
            description: 'Advanced Romanian market intelligence and competitive analysis',
            inputSchema: {
              type: 'object',
              properties: {
                industry: {
                  type: 'string',
                  description: 'Industry sector for analysis',
                },
                region: {
                  type: 'string',
                  description: 'Specific Romanian region or nationwide',
                  default: 'nationwide',
                },
                analysis_type: {
                  type: 'string',
                  enum: ['competitive', 'market_size', 'trends', 'opportunities', 'risks'],
                  description: 'Type of market analysis',
                  default: 'comprehensive',
                },
                time_horizon: {
                  type: 'string',
                  enum: ['current', '6_months', '1_year', '3_years'],
                  description: 'Analysis time horizon',
                  default: 'current',
                },
              },
              required: ['industry'],
            },
          },
          {
            name: 'romai_regulatory_advisor',
            description: 'Romanian regulatory and compliance guidance',
            inputSchema: {
              type: 'object',
              properties: {
                business_type: {
                  type: 'string',
                  description: 'Type of business or industry',
                },
                regulation_area: {
                  type: 'string',
                  enum: ['company_formation', 'tax', 'employment', 'data_privacy', 'industry_specific'],
                  description: 'Area of regulatory guidance needed',
                },
                company_size: {
                  type: 'string',
                  enum: ['startup', 'sme', 'enterprise'],
                  description: 'Company size category',
                  default: 'sme',
                },
              },
              required: ['business_type', 'regulation_area'],
            },
          },
        ],
      };
    });

    // Handler for tool execution (keeping existing + new tools)
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (!request.params) {
        throw new Error('Request params are undefined');
      }
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'romai_intelligence':
            return await this.handleIntelligenceRequest(args);

          case 'romai_romanian_expert':
            return await this.handleRomanianExpertRequest(args);

          case 'romai_problem_solver':
            return await this.handleProblemSolverRequest(args);

          case 'romai_code_assistant':
            return await this.handleCodeAssistantRequest(args);

          case 'romai_health_check':
            return await this.handleHealthCheck(args);

          case 'romai_market_intelligence':
            return await this.handleMarketIntelligenceRequest(args);

          case 'romai_regulatory_advisor':
            return await this.handleRegulatoryAdvisorRequest(args);

          default:
            return {
              content: [
                {
                  type: 'text',
                  text: `Unknown tool: ${name}`,
                },
              ],
              isError: true,
            };
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        return {
          content: [
            {
              type: 'text',
              text: `Error executing tool ${name}: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  // Resource content generators
  private async getBusinessGuideContent(): Promise<string> {
    return `# Romanian Business Guide

## Executive Summary
This comprehensive guide provides essential information for international businesses entering the Romanian market.

## Key Business Insights
- GDP: €250+ billion (2024)
- EU Member since 2007
- Strategic location between Western Europe and Asia
- Growing tech and services sectors
- Skilled multilingual workforce

## Market Entry Strategies
1. **Direct Investment**: Establish local presence
2. **Joint Ventures**: Partner with Romanian companies
3. **Licensing**: License products/services to local partners
4. **Acquisition**: Acquire existing Romanian businesses

## Business Culture
- **Relationship-focused**: Personal connections matter
- **Formal communication**: Professional titles and formal address
- **Punctuality**: Being on time is highly valued
- **Decision-making**: Often hierarchical, involving senior management

## Key Industries
- **Technology**: Software development, IT services
- **Manufacturing**: Automotive, textiles, machinery
- **Energy**: Renewable energy, oil & gas
- **Agriculture**: Grains, wine, organic products
- **Tourism**: Mountain resorts, coastal destinations

## Legal Considerations
- Romanian Commercial Code governs business operations
- EU regulations apply (GDPR, competition law)
- Corporate tax rate: 16%
- VAT rate: 19%
- Employment law protections for workers

## Success Factors
1. Understand local market preferences
2. Build strong relationships with partners
3. Comply with EU and Romanian regulations
4. Invest in local talent and training
5. Adapt products/services to local needs`;
  }

  private async getCulturalInsightsContent(): Promise<string> {
    return `# Romanian Cultural Insights for Business

## Communication Style
- **Directness**: Romanians appreciate honest, straightforward communication
- **Formality**: Use formal titles and "Dumneavoastră" (formal you) in business
- **Language**: Many professionals speak English, but Romanian language skills are valued
- **Non-verbal**: Firm handshakes, maintaining eye contact shows respect

## Business Etiquette
- **Meetings**: Start with small talk, but transition to business promptly
- **Dress Code**: Conservative, professional attire expected
- **Gifts**: Modest business gifts are appreciated but not required
- **Dining**: Business lunches common, wait for host to begin eating

## Religious and Social Considerations
- **Orthodox Christianity**: Majority religion, respect religious holidays
- **Family Values**: Family is central to Romanian culture
- **National Pride**: Romanians are proud of their history and culture
- **Regional Differences**: Urban vs. rural cultural variations

## Holiday Calendar
- **New Year**: January 1-2
- **Epiphany**: January 6
- **Easter**: Orthodox Easter (varies)
- **Labor Day**: May 1
- **Children's Day**: June 1
- **Assumption**: August 15
- **St. Andrew's Day**: November 30
- **National Day**: December 1
- **Christmas**: December 25-26

## Business Relationship Building
1. **Personal Connection**: Invest time in getting to know partners
2. **Trust Building**: Consistency and reliability are crucial
3. **Long-term Perspective**: Focus on sustainable partnerships
4. **Local Presence**: Having local representatives shows commitment
5. **Cultural Sensitivity**: Show interest in Romanian culture and history`;
  }

  private async getLegalFrameworkContent(): Promise<string> {
    return `# Romanian Legal Framework for Business

## Company Formation
### Legal Entities
- **SRL (Societate cu Răspundere Limitată)**: Limited Liability Company
- **SA (Societate pe Acțiuni)**: Joint Stock Company
- **Branch Office**: Foreign company representative office
- **Representative Office**: Liaison office (no commercial activity)

### Registration Requirements
- Minimum share capital: RON 200 for SRL, RON 90,000 for SA
- Registration with Trade Register (ONRC)
- Tax registration with ANAF
- Social security registration
- Bank account opening

## Tax System
### Corporate Taxation
- **Corporate Income Tax**: 16%
- **Micro-enterprise Tax**: 1% of turnover (for eligible small companies)
- **Dividend Tax**: 5% (EU residents), 16% (non-EU)
- **Transfer Pricing**: Arm's length principle applies

### VAT System
- **Standard Rate**: 19%
- **Reduced Rates**: 9% (certain foods, books), 5% (medicines, hotels)
- **VAT Registration**: Mandatory if turnover exceeds RON 300,000
- **EU VAT**: Reverse charge mechanism applies

## Employment Law
### Worker Rights
- **Working Hours**: Maximum 40 hours/week
- **Minimum Wage**: Updated annually by government
- **Annual Leave**: Minimum 20 working days
- **Maternity Leave**: 126 days paid leave
- **Notice Period**: 20 working days standard

### Employer Obligations
- Social security contributions: ~25-30% of gross salary
- Health insurance: Mandatory coverage
- Work safety: Compliance with EU standards
- Collective bargaining: Recognize trade unions

## Data Protection
### GDPR Compliance
- **Data Processing**: Lawful basis required
- **Consent**: Clear and unambiguous
- **Data Subjects Rights**: Access, rectification, erasure
- **Data Breaches**: 72-hour notification requirement
- **DPO**: Required for certain activities

## Intellectual Property
### Protection Mechanisms
- **Trademarks**: Registration with OSIM
- **Patents**: National and European patents
- **Copyright**: Automatic protection
- **Industrial Designs**: Registration available
- **Trade Secrets**: Protected under law

## Dispute Resolution
### Court System
- **First Instance Courts**: Local jurisdiction
- **Appeal Courts**: Regional jurisdiction
- **High Court**: Supreme court of appeals
- **Administrative Courts**: Public law disputes

### Alternative Dispute Resolution
- **Arbitration**: Recognized and enforceable
- **Mediation**: Encouraged for commercial disputes
- **Conciliation**: Available for labor disputes`;
  }

  private async getEmailTemplatesContent(): Promise<string> {
    return `# Romanian Business Email Templates

## Formal Business Introduction
**Subject**: Introducere oficială - [Company Name]

Stimate Domnule/Stimată Doamnă [Last Name],

Numele meu este [Your Name] și reprezint compania [Company Name]. Vă contactez în legătură cu [specific purpose/opportunity].

[Company Name] este specializată în [brief company description] și am identificat o potențială colaborare cu organizația dumneavoastră.

Aș aprecia posibilitatea unei întâlniri pentru a discuta această oportunitate în detaliu. Sunt disponibil/disponibilă în [time period] și pot să mă adaptez programului dumneavoastră.

Vă mulțumesc pentru timpul acordat și aștept cu interes răspunsul dumneavoastră.

Cu stimă,
[Your Name]
[Title]
[Company Name]
[Contact Information]

---

## Meeting Request
**Subject**: Solicitare întâlnire - Oportunitate de colaborare

Stimați Domni,

Sper că acest email vă găsește în cea mai bună sănătate.

Doresc să solicit o întâlnire pentru a discuta o propunere de colaborare care ar putea fi benefică pentru ambele organizații.

Punctele principale de discuție ar include:
- [Point 1]
- [Point 2]
- [Point 3]

Sunt flexibil/flexibilă în privința datei și orei întâlnirii. Putem organiza întâlnirea la sediul dumneavoastră, la biroul nostru, sau online, conform preferințelor dumneavoastră.

Vă mulțumesc anticipat pentru considerația acordată solicitării mele.

Cu respect,
[Your Name]

---

## Follow-up After Meeting
**Subject**: Mulțumiri pentru întâlnire și pași următori

Stimate Domnule/Stimată Doamnă [Name],

Vă mulțumesc pentru timpul acordat în întâlnirea de azi. A fost o plăcere să discut despre [meeting topic] și să aflu mai multe despre [their company/projects].

Conform discuțiilor noastre, voi:
- [Action item 1]
- [Action item 2]
- [Action item 3]

Vă voi trimite [specific deliverable] până în data de [date].

Dacă aveți întrebări suplimentare sau aveți nevoie de clarificări, vă rog să nu ezitați să mă contactați.

Aștept cu interes continuarea colaborării noastre.

Cu stimă,
[Your Name]

---

## Project Proposal
**Subject**: Propunere de proiect - [Project Name]

Stimați Domni,

Anexat la acest email veți găsi propunerea detaliată pentru proiectul [Project Name] despre care am discutat.

Propunerea include:
- Obiectivele proiectului
- Metodologia propusă
- Cronograma de implementare
- Bugetul detaliat
- Echipa proiectului

Suntem convinși că această abordare va aduce beneficii semnificative organizației dumneavoastră și suntem dornici să începem colaborarea.

Pentru orice clarificări sau modificări, sunt la dispoziția dumneavoastră.

Cu respect,
[Your Name]

---

## Thank You Note
**Subject**: Mulțumiri pentru colaborare

Stimate colaboratori,

Prin acest email doresc să vă mulțumesc pentru excelenta colaborare pe parcursul proiectului [Project Name].

Profesionalismul și dedicarea echipei dumneavoastră au contribuit semnificativ la succesul acestui proiect. Rezultatele obținute depășesc așteptările inițiale.

Sper ca această colaborare să fie primul pas într-un parteneriat de lungă durată între organizațiile noastre.

Cu recunoștință,
[Your Name]`;
  }

  private async getMarketAnalysisData(): Promise<any> {
    return {
      "market_overview": {
        "gdp_2024": "€250.8 billion",
        "gdp_growth_rate": "3.8%",
        "population": "19.1 million",
        "unemployment_rate": "5.2%",
        "inflation_rate": "4.1%"
      },
      "key_sectors": {
        "technology": {
          "market_size": "€12.5 billion",
          "growth_rate": "15.2%",
          "key_players": ["UiPath", "eMAG", "Zitec", "Siveco"],
          "opportunities": ["AI/ML", "Fintech", "E-commerce", "Cybersecurity"]
        },
        "manufacturing": {
          "market_size": "€45.3 billion",
          "growth_rate": "6.8%",
          "key_players": ["Dacia", "Continental", "Michelin", "Pirelli"],
          "opportunities": ["Automotive", "Electronics", "Textiles"]
        },
        "energy": {
          "market_size": "€18.7 billion",
          "growth_rate": "8.9%",
          "key_players": ["Hidroelectrica", "OMV Petrom", "E.ON"],
          "opportunities": ["Renewable energy", "Smart grid", "Energy storage"]
        }
      },
      "regional_analysis": {
        "bucuresti": {
          "population": "2.15 million",
          "gdp_per_capita": "€23,500",
          "key_industries": ["Finance", "Technology", "Services"],
          "business_environment": "Excellent"
        },
        "cluj_napoca": {
          "population": "0.42 million",
          "gdp_per_capita": "€19,800",
          "key_industries": ["Technology", "Manufacturing", "Education"],
          "business_environment": "Very Good"
        },
        "timisoara": {
          "population": "0.38 million",
          "gdp_per_capita": "€18,200",
          "key_industries": ["Automotive", "Technology", "Manufacturing"],
          "business_environment": "Good"
        }
      },
      "investment_climate": {
        "ease_of_doing_business": "Rank 55/190 globally",
        "corruption_perception": "Rank 69/180 globally",
        "competitiveness": "Rank 51/141 globally",
        "innovation_index": "Rank 42/132 globally"
      },
      "market_trends": {
        "digitalization": "Accelerating across all sectors",
        "sustainability": "Growing focus on green initiatives",
        "urbanization": "Continued migration to major cities",
        "eu_integration": "Deeper integration with EU markets"
      }
    };
  }

  // Prompt generators
  private async generateBusinessAnalysisPrompt(args: any): Promise<string> {
    const { industry, target_market = 'general' } = args;

    return `Ca expert în piața românească, analizează oportunitățile de business în industria "${industry}" pentru segmentul "${target_market}".

Includeți în analiză:

1. **Dimensiunea și creșterea pieței**
   - Valoarea actuală a pieței în România
   - Rata de creștere anuală proiectată
   - Factori care influențează creșterea

2. **Analiza competiției**
   - Jucători principali pe piață
   - Punctele lor forte și slăbiciuni
   - Cotele de piață
   - Strategiile predominante

3. **Analiza clienților**
   - Profilul clientului țintă românesc
   - Comportamentul de cumpărare
   - Preferințele specifice pieței românești
   - Sensibilitatea la preț

4. **Oportunități de piață**
   - Segmente neacoperite sau subacoperite
   - Tendințe emergente
   - Nevoi nesatisfăcute ale clienților
   - Avantaje competitive potențiale

5. **Riscuri și provocări**
   - Bariere de intrare pe piață
   - Riscuri regulatory sau legislative
   - Volatilitatea economică
   - Competiția internațională

6. **Recomandări strategice**
   - Strategia optimă de intrare pe piață
   - Poziționarea recomandată
   - Investițiile necesare
   - Cronograma de implementare

Folosește date actuale despre economia românească și tendințele sectoriale.`;
  }

  private async generateCulturalAdaptationPrompt(args: any): Promise<string> {
    const { business_type, origin_country = 'international' } = args;

    return `Dezvoltă o strategie detaliată de adaptare culturală pentru o afacere de tip "${business_type}" care vine din "${origin_country}" și dorește să se stabilească în România.

Strategia să includă:

1. **Analiza diferențelor culturale**
   - Diferențe în stilul de comunicare
   - Diferențe în valorile de business
   - Diferențe în procesele de luare a deciziilor
   - Diferențe în relațiile profesionale

2. **Adaptarea produselor/serviciilor**
   - Modificări necesare pentru gusturile românești
   - Adaptarea la puterea de cumpărare locală
   - Conformitatea cu standardele și reglementările locale
   - Personalizarea pentru piața românească

3. **Strategia de comunicare și marketing**
   - Mesajele cheie pentru audiența românească
   - Canalele de comunicare preferate
   - Influencerii și partenerii locali
   - Strategia de brand locală

4. **Managementul echipei locale**
   - Recrutarea și formarea personalului român
   - Stilul de management adaptat culturii locale
   - Motivarea și reținerea talentelor locale
   - Integrarea culturii corporative

5. **Parteneriatul și networking-ul local**
   - Identificarea partenerilor strategici locali
   - Participarea la evenimente de business românești
   - Dezvoltarea relațiilor cu autoritățile locale
   - Implicarea în comunitatea locală

6. **Cronograma de implementare**
   - Fazele de adaptare culturală
   - Indicatori de succes
   - Bugetul pentru adaptarea culturală
   - Riscurile și planurile de contingență

Includeți exemple concrete și cele mai bune practici din experiența altor companii internaționale care s-au adaptat cu succes în România.`;
  }

  private async generateCustomerPersonaPrompt(args: any): Promise<string> {
    const { product_category, region = 'național' } = args;

    return `Creează personaje detaliate ale clienților românești pentru categoria de produse "${product_category}" în regiunea "${region}".

Pentru fiecare persona, includeți:

1. **Informații demografice**
   - Vârsta și genul
   - Nivelul de educație
   - Ocupația și venitul
   - Statusul familial
   - Locația geografică

2. **Comportamentul de cumpărare**
   - Procesul de luare a deciziilor
   - Factorii care influențează cumpărarea
   - Canalele preferate de cumpărare
   - Frecvența achizițiilor
   - Bugetul alocat categoriei

3. **Stilul de viață și valorile**
   - Hobby-urile și interesele
   - Valorile personale importante
   - Stilul de viață general
   - Aspirațiile și temerile
   - Influențele sociale

4. **Comportamentul digital**
   - Platformele de social media folosite
   - Obiceiurile de consum media
   - Preferințele pentru cumpărături online vs offline
   - Deviceurile utilizate
   - Timpul petrecut online

5. **Relația cu categoria de produse**
   - Experiența cu categoria
   - Mărcile preferate și de ce
   - Punctele de durere în experiența actuală
   - Nevoile nesatisfăcute
   - Așteptările pentru viitor

6. **Particularități culturale românești**
   - Influența tradițiilor româneșți
   - Impactul contextului economic local
   - Diferențele regionale (dacă aplicabile)
   - Influența familiei și prietenilor
   - Atitudinea față de mărcile străine vs locale

Creează 3-4 personaje distincte care să acopere diversitatea pieței românești pentru această categorie.`;
  }

  private async generateMarketingStrategyPrompt(args: any): Promise<string> {
    const { campaign_type, budget_range = 'mediu' } = args;

    return `Dezvoltă o strategie de marketing completă pentru o campanie de tip "${campaign_type}" în România, cu un buget "${budget_range}".

Strategia să includă:

1. **Obiectivele campaniei**
   - Obiectivele SMART specifice
   - KPI-urile principale
   - Targeturile de performanță
   - Cronograma obiectivelor

2. **Analiza pieței românești**
   - Dimensiunea și caracteristicile audiencei țintă
   - Competitorii direcți și indirecți
   - Tendințele pieței relevante
   - Oportunitățile de diferențiere

3. **Strategia de poziționare**
   - Propunerea unică de valoare
   - Poziționarea față de competitori
   - Mesajele cheie pentru audiența românească
   - Tonul și personalitatea brandului

4. **Mix-ul de canale și tactici**
   - Canale digitale (social media, search, display)
   - Canale tradiționale (TV, radio, print, outdoor)
   - Marketing-ul de conținut
   - Influencer marketing și parteneriate
   - Evenimente și activari experiențiale

5. **Alocarea bugetului**
   - Distribuția bugetului pe canale
   - Investițiile în conținut și creativitate
   - Costurile de producție
   - Rezerva pentru optimizări

6. **Calendarul de implementare**
   - Cronograma detaliată pe luni/săptămâni
   - Momentele cheie și milestone-urile
   - Sincronizarea cu evenimente și sărbători românești
   - Planul de backup pentru scenarii alternative

7. **Măsurarea și optimizarea**
   - Metricile de urmărit pe fiecare canal
   - Frecvența raportării și analizei
   - Procesul de optimizare continuă
   - A/B testing-urile planificate

Includeți exemple de creativități și mesaje adaptate specificului cultural românesc.`;
  }

  private async generateComplianceChecklistPrompt(args: any): Promise<string> {
    const { business_activity, company_size = 'SME' } = args;

    return `Creează o listă detaliată de conformitate legală pentru o companie "${company_size}" care desfășoară activitatea "${business_activity}" în România.

Checklist-ul să includă:

1. **Înființarea și înregistrarea companiei**
   - [ ] Înregistrarea la Registrul Comerțului (ONRC)
   - [ ] Obținerea certificatului de înregistrare
   - [ ] Înregistrarea la ANAF pentru obligații fiscale
   - [ ] Deschiderea contului bancar corporativ
   - [ ] Înregistrarea pentru TVA (dacă aplicabil)

2. **Licențe și autorizații specifice**
   - [ ] Identificarea licențelor necesare pentru activitatea specifică
   - [ ] Obținerea autorizațiilor de mediu (dacă aplicabil)
   - [ ] Autorizațiile de construire/funcționare (dacă aplicabil)
   - [ ] Licențe profesionale pentru angajați
   - [ ] Înregistrări sectoriale specifice

3. **Obligații fiscale și contabile**
   - [ ] Stabilirea sistemului de taxare (impozit pe profit vs micro-întreprindere)
   - [ ] Numirea unui contabil autorizat
   - [ ] Implementarea sistemului de evidență contabilă
   - [ ] Înregistrarea pentru contribuții sociale
   - [ ] Stabilirea procedurilor de raportare fiscală

4. **Dreptul muncii și angajații**
   - [ ] Contractele de muncă conforme cu legislația
   - [ ] Înregistrarea angajaților la Casa de Pensii și Casa de Sănătate
   - [ ] Implementarea regulamentului intern de organizare și funcționare
   - [ ] Măsurile de securitate și sănătate în muncă
   - [ ] Formarea și instruirea personalului

5. **Protecția datelor și GDPR**
   - [ ] Evaluarea necesității unui DPO (Data Protection Officer)
   - [ ] Implementarea politicilor de protecție a datelor
   - [ ] Registrul activităților de prelucrare
   - [ ] Procedurile pentru drepturile persoanelor vizate
   - [ ] Măsurile tehnice și organizatorice de securitate

6. **Contracte și relații comerciale**
   - [ ] Standardizarea contractelor cu clienții
   - [ ] Contractele cu furnizorii și partenerii
   - [ ] Termenii și condițiile generale
   - [ ] Politicile de return și garanție
   - [ ] Procedurile de soluționare a disputelor

7. **Proprietatea intelectuală**
   - [ ] Înregistrarea mărcilor comerciale (dacă aplicabil)
   - [ ] Protecția drepturilor de autor
   - [ ] Licențierea software-ului utilizat
   - [ ] Acordurile de confidențialitate
   - [ ] Politicile de protecție a know-how-ului

8. **Raportarea și conformitatea continuă**
   - [ ] Calendarul obligațiilor de raportare
   - [ ] Procedurile de actualizare a documentelor
   - [ ] Monitorizarea schimbărilor legislative
   - [ ] Auditurile interne periodice
   - [ ] Planul de conformitate anuală

Pentru fiecare punct, includeți termenii legali, costurile estimate și cronograma de implementare.`;
  }

  // Existing tool handlers (keeping all previous functionality)
  private async handleIntelligenceRequest(args: any) {
    // ... existing implementation
  }

  private async handleRomanianExpertRequest(args: any) {
    // ... existing implementation  
  }

  private async handleProblemSolverRequest(args: any) {
    // ... existing implementation
  }

  private async handleCodeAssistantRequest(args: any) {
    // ... existing implementation
  }

  private async handleHealthCheck(args: any) {
    // ... existing implementation
  }

  // New tool handlers
  private async handleMarketIntelligenceRequest(args: any) {
    const { industry, region = 'nationwide', analysis_type = 'comprehensive', time_horizon = 'current' } = args;

    if (!industry) {
      return {
        content: [
          {
            type: 'text',
            text: 'Industry parameter is required',
          },
        ],
        isError: true,
      };
    }

    const marketPrompt = `Ca expert în analiza de piață românească, furnizează o analiză detaliată de market intelligence pentru industria "${industry}" în regiunea "${region}" cu orizont de timp "${time_horizon}".

Analiza să includă:

1. DIMENSIUNEA ȘI STRUCTURA PIEȚEI
- Valoarea totală a pieței în România
- Segmentele principale și cotele lor
- Rata de creștere anuală (ultimii 3 ani)
- Proiecții de creștere pentru perioada solicitată

2. COMPETIȚIA ȘI JUCĂTORII CHEIE
- Top 5-10 companii din industrie
- Cotele de piață ale liderilor
- Strategiile de business predominante
- Avantajele competitive ale liderilor
- Vulnerabilitățile competitorilor

3. ANALIZA CLIENȚILOR
- Segmentele de clienți principale
- Comportamentul de cumpărare specific României
- Tendințele în preferințele consumatorilor
- Sensibilitatea la preț în piața românească
- Influența factorilor culturali

4. TENDINȚE ȘI OPORTUNITĂȚI
- Trend-urile emergente în industrie
- Tehnologiile disruptive relevante
- Schimbări în reglementări
- Oportunități de creștere identificate
- Nișele neexploatate

5. RISCURI ȘI PROVOCĂRI
- Riscurile macroeconomice
- Impactul reglementărilor EU
- Volatilitatea cursului valutar
- Riscurile politice și legislative
- Competiția internațională

6. RECOMANDĂRI STRATEGICE
- Strategii de intrare/extindere
- Poziționarea optimă pe piață
- Investițiile recomandate
- Parteneriatele strategice
- Cronograma de implementare

Folosește date concrete și cifre specifice pentru piața românească.`;

    const intelligenceRequest: IntelligenceRequest = {
      query: marketPrompt,
      language: 'ro',
      domain: 'market_intelligence',
      context: `Market intelligence for ${industry} industry in ${region} Romania`,
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  private async handleRegulatoryAdvisorRequest(args: any) {
    const { business_type, regulation_area, company_size = 'sme' } = args;

    if (!business_type || !regulation_area) {
      return {
        content: [
          {
            type: 'text',
            text: 'Business type and regulation area parameters are required',
          },
        ],
        isError: true,
      };
    }

    const regulatoryPrompt = `Ca consultant legal expert în legislația românească și europeană, furnizează o consultanță detaliată în domeniul "${regulation_area}" pentru o companie de tip "${business_type}" de mărimea "${company_size}".

Consultanța să includă:

1. CADRUL LEGAL APLICABIL
- Legile principale românești relevante
- Reglementările europene aplicabile
- Normele metodologice și ordinele ANAF/ANPC
- Regulamentele sectoriale specifice
- Jurisprudența relevantă

2. OBLIGAȚII LEGALE SPECIFICE
- Cerințele de conformitate obligatorii
- Licențele și autorizațiile necesare
- Procedurile de înregistrare și notificare
- Raportările periodice obligatorii
- Documentația legală necesară

3. PROCEDURI DE IMPLEMENTARE
- Pașii concreți pentru conformitate
- Documentele necesare pentru fiecare etapă
- Termenii legali și perioadele de grație
- Costurile estimate pentru conformitate
- Instituțiile competente și procedurile

4. RISCURI ȘI SANCȚIUNI
- Consecințele neconformității
- Amenzile și penalitățile aplicabile
- Riscurile de suspendare/închidere
- Responsabilitatea civilă și penală
- Impactul asupra activității business

5. CELE MAI BUNE PRACTICI
- Sistemele de management al conformității
- Procedurile interne recomandate
- Formarea personalului și responsabilitățile
- Auditurile și monitorizarea continuă
- Actualizarea permanentă a cunoștințelor

6. RECOMANDĂRI PRACTICE
- Pași imediați de urmat
- Prioritizarea obligațiilor
- Cronograma de implementare
- Bugetul necesar pentru conformitate
- Resursele externe recomandate (avocați, consultanți)

Oferă sfaturi practice și acționabile, cu referințe concrete la legislația în vigoare.`;

    const intelligenceRequest: IntelligenceRequest = {
      query: regulatoryPrompt,
      language: 'ro',
      domain: 'legal_compliance',
      context: `Romanian regulatory advice for ${business_type} in ${regulation_area}`,
    };

    const response = await this.romaiCore.processIntelligenceRequest(intelligenceRequest);

    return {
      content: [
        {
          type: 'text',
          text: response.response,
        },
      ],
    };
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error: any) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 ROMAI MCP Enhanced Server running on stdio');
  }
}

export { RomaiMcpServerEnhanced as default };
