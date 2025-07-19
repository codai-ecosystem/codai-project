# CODAI Ecosystem Environment Setup Plan

## Project Configuration
- **Billing Account:** `01C672-E4DEE1-7B4CDC` (Codai)
- **Region:** `europe-west1` (consistent with existing projects)
- **Base Environment:** From root `.env` file
- **Architecture:** Single Google Cloud project with multiple Firebase web apps

## Unified Architecture Strategy

### Single Google Cloud Project Approach ✅
**Primary Project:** `codai-ecosystem` (637430467623)
- All apps and services run under this single project
- Separate Firebase web apps for each frontend
- Shared backend services, databases, and resources
- Unified billing and permission management
- Better service-to-service communication
- Consistent with monorepo architecture

### Why Single Project is Better:
1. **Cost Efficiency:** No per-project overhead
2. **Simplified Management:** Single billing account, unified permissions
3. **Better Performance:** Internal service communication
4. **Resource Sharing:** Shared databases, storage, caching
5. **Development Experience:** Easier debugging and monitoring
6. **Quota Management:** No individual project limits

### Existing Specialized Projects (Keep Separate)
- `aide-dev-461602` → AIDE (Personal billing account)
- `metu-app` → Metu (MetuXro billing account)  
- `bancai-service` → Can migrate to codai-ecosystem
- `dexai-dictionary` → Can migrate to codai-ecosystem
- `kodex-service` → Can migrate to codai-ecosystem
- `memorai-service` → Can migrate to codai-ecosystem

### Romanian Domains (.ro) - CODAI Ecosystem
```
✅ Acquired Domains:
- acasai.ro → AcasAI (Real Estate AI)
- adoptai.ro → AdoptAI (Pet Adoption AI) [needs app creation]
- ajutai.ro → AjutAI (Help/Support AI)
- analizai.ro → AnalizAI (Analytics AI)
- bancai.ro → BancAI (Banking AI)
- codai.ro → CodAI (Main Platform)
- controlai.ro → ControlAI (Management AI) [needs app creation]
- conversai.ro → ConversAI (Conversation AI)
- cumparai.ro → CumpărAI (Shopping AI)
- curtai.ro → CurtAI (Court/Legal AI)
- dexai.ro → DEXAI (Dictionary AI)
- donai.ro → DonAI (Donation AI)
- explorai.ro → ExplorAI (Explorer AI) [maps to 'explorer' app]
- fabricai.ro → FabricAI (Manufacturing/Creation AI)
- jucai.ro → JucAI (Gaming AI)
- legalizai.ro → LegalizAI (Legal AI)
- logai.ro → LogAI (Logging AI)
- mancai.ro → MancAI (Food AI) [needs app creation]
- marketai.ro → MarketAI (Marketing AI)
- memorai.ro → MemorAI (Memory AI)
- muzicai.ro → MuzicAI (Music AI)
- plecai.ro → PlecAI (Travel AI) [needs app creation]
- prezentai.ro → PrezentAI (Presentation AI)
- promovai.ro → PromovAI (Promotion AI) [needs app creation]
- publicai.ro → PublicAI (Public Services AI)
- romcp.ro → ROMCP (Romanian MCP) [maps to 'romai' app]
- schimbai.ro → SchimbAI (Exchange AI) [needs app creation]
- sociai.ro → SociAI (Social AI)
- stocai.ro → StocAI (Stock/Inventory AI)
- studiai.ro → StudiAI (Study AI)
- sunai.ro → SunAI (Solar/Energy AI)
- talentai.ro → TalentAI (Talent Management AI)
```

### Apps Needing New Google Cloud Projects
1. `acasai` → Create `acasai-service` (acasai.ro)
2. `admin` → Create `admin-service` (admin.codai.ro - internal)
3. `ajutai` → Create `ajutai-service` (ajutai.ro)
4. `analizai` → Create `analizai-service` (analizai.ro)
5. `conversai` → Create `conversai-service` (conversai.ro)
6. `cumparai` → Create `cumparai-service` (cumparai.ro)
7. `curtai` → Create `curtai-service` (curtai.ro)
8. `dash` → Create `dashboard-service` (dash.codai.ro - internal)
9. `donai` → Create `donai-service` (donai.ro)
10. `explorer` → Create `explorer-service` (explorai.ro)
11. `fabricai` → Create `fabricai-service` (fabricai.ro)
12. `glass` → Create `glass-service` (glass.codai.ro - internal)
13. `hub` → Create `hub-service` (hub.codai.ro - internal)
14. `id` → Create `identity-service` (id.codai.ro - internal)
15. `jucai` → Create `jucai-service` (jucai.ro)
16. `legalizai` → Create `legalizai-service` (legalizai.ro)
17. `logai` → Create `logai-service` (logai.ro)
18. `marketai` → Create `marketai-service` (marketai.ro)
19. `metu-web` → Use existing `metu-app` (metu.codai.ro)
20. `mobile` → Create `mobile-service` (mobile.codai.ro - internal)
21. `mod` → Create `mod-service` (mod.codai.ro - internal)
22. `muzicai` → Create `muzicai-service` (muzicai.ro)
23. `prezentai` → Create `prezentai-service` (prezentai.ro)
24. `publicai` → Create `publicai-service` (publicai.ro)
25. `romai` → Create `romai-service` (romcp.ro)
26. `sociai` → Create `sociai-service` (sociai.ro)
27. `stocai` → Create `stocai-service` (stocai.ro)
28. `studiai` → Create `studiai-service` (studiai.ro)
29. `sunai` → Create `sunai-service` (sunai.ro)
30. `talentai` → Create `talentai-service` (talentai.ro)
31. `tools` → Create `tools-service` (tools.codai.ro - internal)
32. `wallet` → Create `wallet-service` (wallet.codai.ro - internal)
33. `x` → Create `x-service` (x.codai.ro - internal)

### Domain Strategy
- **Public Apps:** Use dedicated `.ro` domains (e.g., acasai.ro, bancai.ro)
- **Internal/Admin Apps:** Use `*.codai.ro` subdomains
- **DNS Management:** Vercel DNS for all domains

## Environment Variables Strategy

### Base Configuration (from root .env)
- Azure OpenAI API (shared across all)
- GitHub App credentials (shared)
- Stripe configuration (shared payment processing)
- Basic development settings

### App-Specific Configurations
Each app gets:
- Own Firebase project configuration
- Own Google Cloud project settings
- App-specific database URLs
- Custom API endpoints
