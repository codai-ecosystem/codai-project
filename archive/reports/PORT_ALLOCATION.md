# Codai Ecosystem Port Allocation

## Port Allocation Strategy

**Port Range**: 3000-3099 (100 ports available)
**Allocation Method**: Priority-based with logical grouping

### Foundation Tier (Priority 1) - Ports 3000-3009

| Service | Port | Domain     | Description                   |
| ------- | ---- | ---------- | ----------------------------- |
| codai   | 3000 | codai.ro   | Central Platform & AIDE Hub   |
| memorai | 3001 | memorai.ro | AI Memory & Database Core     |
| logai   | 3002 | logai.ro   | Identity & Authentication Hub |

### Business Tier (Priority 2) - Ports 3010-3019

| Service  | Port | Domain           | Description          |
| -------- | ---- | ---------------- | -------------------- |
| bancai   | 3010 | bancai.ro        | Financial Platform   |
| wallet   | 3011 | wallet.bancai.ro | Programmable Wallet  |
| fabricai | 3012 | fabricai.ro      | AI Services Platform |

### User Tier (Priority 3) - Ports 3020-3029

| Service  | Port | Domain      | Description           |
| -------- | ---- | ----------- | --------------------- |
| studiai  | 3020 | studiai.ro  | AI Education Platform |
| sociai   | 3021 | sociai.ro   | AI Social Platform    |
| cumparai | 4009 | cumparai.ro | AI Shopping Platform  |

### Specialized Tier (Priority 4) - Ports 3030-3039

| Service  | Port | Domain      | Description                   |
| -------- | ---- | ----------- | ----------------------------- |
| x        | 3030 | x.codai.ro  | AI Trading Platform           |
| publicai | 3031 | publicai.ro | Civic AI & Transparency Tools |

### Support Services - Ports 3040-3099

| Service   | Port | Domain             | Description                       |
| --------- | ---- | ------------------ | --------------------------------- |
| admin     | 3040 | admin.codai.ro     | Admin Panel & Management          |
| AIDE      | 3041 | aide.codai.ro      | AI Development Environment        |
| ajutai    | 3042 | ajutai.ro          | AI Support & Help Platform        |
| analizai  | 3043 | analizai.ro        | AI Analytics Platform             |
| dash      | 3044 | dash.codai.ro      | Analytics Dashboard               |
| docs      | 3045 | docs.codai.ro      | Documentation Platform            |
| explorer  | 3046 | explorer.codai.ro  | AI Blockchain Explorer            |
| hub       | 3047 | hub.codai.ro       | Central Hub & Dashboard           |
| id        | 3048 | id.codai.ro        | Identity Management System        |
| jucai     | 3049 | jucai.ro           | AI Gaming Platform                |
| kodex     | 3050 | kodex.codai.ro     | Code Repository & Version Control |
| legalizai | 3051 | legalizai.ro       | AI Legal Services Platform        |
| marketai  | 3052 | marketai.ro        | AI Marketing Platform             |
| metu      | 3053 | metu.codai.ro      | AI Metrics & Analytics            |
| mod       | 3054 | mod.codai.ro       | Modding & Extension Platform      |
| stocai    | 3055 | stocai.ro          | AI Stock Trading Platform         |
| templates | 3056 | templates.codai.ro | Shared Templates & Boilerplates   |
| tools     | 3057 | tools.codai.ro     | Development Tools & Utilities     |

## Environment Variables

Each service will have:

- `PORT`: Assigned port number
- `NEXT_PUBLIC_APP_URL`: Full URL with custom port
- `NEXT_PUBLIC_API_URL`: API endpoint URL

## Testing Configuration

Browser tests will use these ports for:

- Direct service access
- Inter-service communication testing
- Load balancing validation
- Service discovery testing

## Implementation Status

- [ ] Foundation Tier (3000-3009)
- [ ] Business Tier (3010-3019)
- [ ] User Tier (3020-3029)
- [ ] Specialized Tier (3030-3039)
- [ ] Support Services (3040-3099)
- [ ] Update browser test configuration
- [ ] Update Docker Compose files
- [ ] Update Kubernetes manifests
