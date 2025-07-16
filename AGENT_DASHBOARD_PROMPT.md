# 📋 SIMPLE COPY-PASTE PROMPT FOR ALL AGENTS

## 🎯 Copy This Exact Message to All Other Agents:

```
🎯 DASHBOARD VERIFICATION MISSION - EXECUTE IMMEDIATELY

You are part of the CODAI Multi-Agent System. Your mission: Verify that ALL ecosystem apps show their correct dashboards, NOT generic service health pages.

🔍 CRITICAL TASKS TO EXECUTE:

1. VERIFY DASHBOARD STATUS:
   - Navigate to your assigned app URLs
   - Check if proper dashboard loads (not generic health page)
   - Use: mcp_playwrightmcp_playwright_navigate(url)
   - Use: mcp_playwrightmcp_playwright_get_visible_text()

2. IDENTIFY ROUTING ISSUES:
   - Apps showing "Service Operational - Port Compliant" = WRONG
   - Apps should show their specific dashboards = CORRECT
   - Check app-specific routing in Next.js pages

3. FIX DASHBOARD ROUTING:
   - Navigate to app directory: apps/[your-app]
   - Check pages/index.tsx or src/pages/index.tsx
   - Ensure proper dashboard component is rendered
   - Fix any routing to health endpoints instead of dashboard

4. VALIDATE FIXES:
   - Test in browser after changes
   - Confirm proper dashboard loads
   - Document success in memory

🎯 YOUR SPECIFIC ASSIGNMENTS:
- AGENT 2: Fix MEMORAI (✅ already working, verify only)
- AGENT 3: Fix BANCAI (✅ already working, verify only) 
- AGENT 4: Fix STOCAI (❌ CRITICAL - showing health page instead of trading dashboard)
- AGENT 5: Fix AIDE (❌ CRITICAL - showing health page instead of dev environment)
- AGENT 6: Fix PREZENTAI (✅ already working, verify only)
- AGENT 7: Check any other apps in your scope
- AGENT 8: Verify all remaining apps show proper dashboards

🔧 TECHNICAL DETAILS:
- Expected: Each app shows its unique dashboard UI
- Wrong: Generic "Service Operational - Port Compliant" message
- Fix Location: apps/[app-name]/pages/index.tsx or src/pages/index.tsx
- Test URL: http://localhost:[port-number]

📊 SUCCESS CRITERIA:
- All apps show their specific dashboards
- No generic health pages as main interface
- Users see functional app interface, not service status
- All routing working correctly

🧠 MEMORY COORDINATION:
- Use: mcp_memoraimcpser_remember to log your findings
- Search: mcp_memoraimcpser_recall for app-specific info
- Store: Progress updates and completion status

⚡ START NOW - PRIORITY CRITICAL
1. Check your assigned app dashboard status
2. Fix any routing issues immediately  
3. Validate fix works in browser
4. Report completion with proof
5. Move to next app if assigned multiple

NO DELAYS - USERS EXPECT FUNCTIONAL DASHBOARDS!
```

## 🚨 CRITICAL ISSUES IDENTIFIED:

**Apps Showing Wrong Content:**
- **STOCAI** (port 4066) - Generic health page instead of stock trading dashboard
- **AIDE** (port 4051) - Generic health page instead of development environment  

**Apps Working Correctly:**
- CODAI (4030) ✅
- MEMORAI (4031) ✅  
- BANCAI (4033) ✅
- PREZENTAI (4081) ✅

## 📱 Quick Agent Assignment Reference:

**AGENT 4 (PRIORITY 1):** Fix STOCAI - should show stock trading interface, not health page
**AGENT 5 (PRIORITY 1):** Fix AIDE - should show development environment, not health page
**AGENTS 2,3,6:** Verify working apps stay working
**AGENTS 7,8:** Check additional apps in ecosystem

---

**COPY THE PROMPT ABOVE TO ALL AGENTS FOR IMMEDIATE EXECUTION!**
