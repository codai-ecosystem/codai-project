# 👥 ROMAI User Guide

Complete guide for using the Romanian AI Central Intelligence System.

## Getting Started

ROMAI is designed to be your intelligent Romanian assistant, providing expert knowledge and assistance across multiple domains. Whether you need help with Romanian culture, coding assistance in Romanian, or general problem-solving, ROMAI is here to help.

### What Makes ROMAI Special

- **🇷🇴 Romanian-First**: Native Romanian language understanding and cultural context
- **🧠 Intelligent**: Advanced AI capabilities powered by Azure OpenAI
- **🔧 Versatile**: Multiple interfaces - Web dashboard, API, and MCP integration
- **📚 Expert**: Specialized knowledge in Romanian culture, history, and context
- **⚡ Fast**: Optimized for quick responses and efficient processing

## Access Methods

### 1. Web Dashboard

The easiest way to interact with ROMAI is through the web dashboard.

**URL**: http://localhost:4000 (development) or https://dashboard.romai.ro (production)

#### Dashboard Features

- **Real-time Chat**: Direct conversation with ROMAI
- **Romanian Expert Mode**: Specialized cultural assistance
- **System Monitoring**: Health status and performance metrics
- **Dark/Light Theme**: Choose your preferred interface
- **Responsive Design**: Works on desktop, tablet, and mobile

#### Using the Dashboard

1. **Access the Dashboard**
   - Open your browser and navigate to the dashboard URL
   - The interface loads automatically, no login required for basic access

2. **Start a Conversation**
   - Type your question in Romanian or English
   - Click "Send" or press Enter
   - ROMAI will respond with intelligent answers

3. **Use Expert Mode**
   - Click "Romanian Expert" for cultural questions
   - Get specialized answers about Romanian traditions, history, language, and more

4. **Monitor Performance**
   - View system health indicators
   - Check response times and API status
   - Monitor Azure OpenAI connectivity

### 2. API Access

For developers and advanced users, ROMAI provides a comprehensive REST API.

#### Authentication

First, get an authentication token:

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"romai","password":"romai2025"}'
```

#### Basic Usage

```bash
# Ask a general question
curl -X POST http://localhost:8000/intelligence \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Care sunt cele mai frumoase locuri din România?",
    "language": "ro"
  }'

# Romanian cultural expertise
curl -X POST http://localhost:8000/romanian-expert \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Ce înseamnă tradițiile de Paște în România?",
    "category": "traditions"
  }'
```

### 3. MCP Integration

Use ROMAI with Claude Desktop, Cline, or other MCP-compatible applications.

#### With Claude Desktop

1. Add ROMAI to your Claude Desktop configuration
2. Restart Claude Desktop  
3. Ask Claude to use ROMAI tools:
   - "Use romai_romanian_expert to explain Romanian holidays"
   - "Use romai_intelligence to solve this problem"

#### With Cline (VS Code)

1. Configure ROMAI as an MCP server in Cline
2. Use ROMAI tools in your coding workflow
3. Get Romanian-language coding assistance

## Common Use Cases

### 1. Learning About Romanian Culture

**Question**: "Explică-mi tradițiile de Mărțișor"

**ROMAI Response**: Detailed explanation of Mărțișor traditions, historical significance, regional variations, and modern celebrations.

**Best Practice**: Use the Romanian Expert mode for cultural questions to get the most comprehensive and accurate information.

### 2. Romanian Language Help

**Question**: "Cum se conjugă verbul 'a fi' în română?"

**ROMAI Response**: Complete conjugation tables, usage examples, and grammatical explanations in Romanian.

**Tip**: ROMAI understands both formal and colloquial Romanian and can explain language nuances.

### 3. Programming Assistance

**Question**: "Cum implementez autentificare JWT în Node.js cu explicații în română?"

**ROMAI Response**: Step-by-step code examples with Romanian comments and explanations.

**Use Case**: Perfect for Romanian developers who want technical documentation in their native language.

### 4. Problem Solving

**Question**: "Cum pot organiza un eveniment cultural românesc?"

**ROMAI Response**: Structured plan with steps, considerations, and specific Romanian cultural elements to include.

**Advantage**: ROMAI provides context-aware solutions that consider Romanian cultural aspects.

### 5. Travel and Tourism

**Question**: "Care sunt cele mai frumoase obiective turistice din Transilvania?"

**ROMAI Response**: Detailed recommendations with historical context, practical information, and cultural significance.

**Value**: Local expertise and cultural context you won't find in generic travel guides.

## Tips for Best Results

### 1. Be Specific

**Good**: "Explică-mi procesul de preparare a sărmălelor pentru Crăciun"
**Better**: "Explică-mi procesul de preparare a sărmălelor de varză pentru masa de Crăciun, inclusiv ingredientele tradiționale și tehnicile specifice regiunii Moldovei"

### 2. Use Romanian When Possible

ROMAI is optimized for Romanian language input and provides more nuanced responses when you ask questions in Romanian.

### 3. Specify Context

For better responses, provide context:
- "În contextul educației românești..."
- "Pentru o aplicație web destinată pieței românești..."
- "Având în vedere tradițiile din regiunea Maramureș..."

### 4. Choose the Right Interface

- **Dashboard**: Quick questions, casual conversation
- **API**: Integration with your applications  
- **MCP**: Professional workflows with Claude/Cline

## Understanding ROMAI Responses

### Response Structure

ROMAI responses typically include:

1. **Main Answer**: Direct response to your question
2. **Confidence Level**: How certain ROMAI is about the answer
3. **Sources**: Where the information comes from
4. **Related Topics**: Suggestions for follow-up questions
5. **Additional Suggestions**: Ways to explore the topic further

### Response Quality Indicators

- **High Confidence (0.9-1.0)**: Very reliable information
- **Medium Confidence (0.7-0.8)**: Good information, might benefit from verification
- **Low Confidence (0.5-0.6)**: General guidance, seek additional sources

### Cultural Context Awareness

ROMAI provides responses that consider:
- **Regional Variations**: Different traditions across Romanian regions
- **Historical Context**: How traditions evolved over time
- **Modern Adaptations**: How traditions are practiced today
- **Social Significance**: The cultural importance of customs and practices

## Troubleshooting

### Common Issues

#### 1. Dashboard Not Loading
- **Solution**: Check if the API server is running on port 8000
- **Check**: Verify your internet connection
- **Alternative**: Try refreshing the page or clearing browser cache

#### 2. API Authentication Fails
- **Solution**: Verify username/password (default: romai/romai2025)
- **Check**: Ensure the JWT token is properly included in requests
- **Debug**: Check if the token has expired (24-hour validity)

#### 3. Slow Responses
- **Cause**: Complex questions require more processing time
- **Normal**: 5-15 seconds for complex cultural questions
- **Optimization**: Break complex questions into smaller parts

#### 4. Romanian Characters Display Issues
- **Solution**: Ensure your browser/application supports UTF-8 encoding
- **Check**: Browser language settings
- **Fix**: Try a different browser or update your current one

### Getting Help

1. **Check Health Status**: Use `/health` endpoint or dashboard health indicators
2. **Review Documentation**: Check the API documentation for specific issues
3. **Contact Support**: team@codai.ro for technical issues
4. **Community**: Join our Discord server (coming soon)

## Advanced Features

### 1. Custom Contexts

Provide specific contexts for more targeted responses:

```json
{
  "query": "Cum optimizez performanța aplicației?",
  "context": "Aplicație React pentru e-commerce românesc cu 10000+ utilizatori"
}
```

### 2. Domain-Specific Responses

Use domain hints for specialized knowledge:

```json
{
  "query": "Strategii de marketing digital",
  "domain": "business",
  "context": "Piața românească, target tineri 18-35 ani"
}
```

### 3. Multi-turn Conversations

Build on previous conversations for context-aware responses:

```json
{
  "messages": [
    {"role": "user", "content": "Spune-mi despre vinurile românești"},
    {"role": "assistant", "content": "România are o tradiție viticolă de peste 6000 de ani..."},
    {"role": "user", "content": "Care sunt cele mai bune regiuni viticole?"}
  ]
}
```

## Privacy and Security

### Data Handling

- **No Personal Data Storage**: ROMAI doesn't store personal conversations
- **Temporary Processing**: Questions are processed and discarded
- **Secure Communication**: All API calls use secure protocols
- **Azure OpenAI Compliance**: Follows Microsoft's security standards

### Best Practices

1. **Don't Share Sensitive Information**: Avoid personal data in questions
2. **Use Strong Authentication**: Change default passwords in production
3. **Monitor Usage**: Keep track of API usage for unusual patterns
4. **Keep Updated**: Regularly update ROMAI for security patches

## Contributing and Feedback

### How to Contribute

1. **Report Issues**: Use GitHub issues for bugs or feature requests
2. **Suggest Improvements**: Email suggestions to feedback@codai.ro
3. **Cultural Content**: Help improve Romanian cultural knowledge
4. **Translation**: Assist with multilingual support

### Feedback Guidelines

When providing feedback, include:
- **What you were trying to do**
- **What you expected to happen**
- **What actually happened**
- **Steps to reproduce the issue**

## Future Features

### Coming Soon

- **Voice Interface**: Speak to ROMAI in Romanian
- **Image Understanding**: Ask questions about Romanian cultural artifacts
- **Document Analysis**: Upload Romanian documents for analysis
- **Mobile App**: Native mobile applications
- **Offline Mode**: Basic functionality without internet

### Planned Integrations

- **WordPress Plugin**: ROMAI for Romanian websites
- **Slack Bot**: Team integration for Romanian companies
- **Telegram Bot**: Instant access to Romanian AI assistance
- **Browser Extension**: ROMAI assistance while browsing

## Resources

### Documentation
- **API Reference**: [docs/api.md](api.md)
- **MCP Integration**: [docs/mcp-integration.md](mcp-integration.md)
- **Deployment Guide**: [docs/deployment.md](deployment.md)

### Learning Resources
- **Romanian Culture Database**: Extensive cultural knowledge base
- **Language Resources**: Romanian grammar and usage guides
- **Historical Context**: Comprehensive historical information

### Support Channels
- **Email**: support@codai.ro
- **Documentation**: https://docs.romai.ro
- **GitHub**: https://github.com/codai/romai
- **Status Page**: https://status.romai.ro (coming soon)

---

**Welcome to ROMAI - Your Romanian AI Assistant!** 🇷🇴🤖
