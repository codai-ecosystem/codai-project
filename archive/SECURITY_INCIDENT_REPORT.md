# NPM Security Report - Malware Detection

## Incident Details
**Date:** July 18, 2025
**Malware Type:** Trojan:Win32/Wacatac.H!ml
**Detection Method:** Windows Defender / Antivirus scan

## Affected Packages
The following npm packages contained malicious `node-gyp.dll` files:

### 1. @pkgr/core
- **File:** `node_modules/@pkgr/core/node-gyp.dll`
- **Issue:** This package should not contain native binaries
- **Package URL:** https://npmjs.com/package/@pkgr/core

### 2. eslint-config-prettier  
- **File:** `node_modules/eslint-config-prettier/node-gyp.dll`
- **Issue:** Configuration package should not contain DLL files
- **Package URL:** https://npmjs.com/package/eslint-config-prettier

### 3. napi-postinstall
- **File:** `node_modules/napi-postinstall/node-gyp.dll`  
- **Issue:** Suspicious package with malicious binary
- **Package URL:** https://npmjs.com/package/napi-postinstall

## Analysis
- **None of these packages should legitimately contain `node-gyp.dll` files**
- **Particularly suspicious:** eslint-config-prettier is a pure configuration package
- **High confidence:** These are compromised/malicious package versions

## Actions Taken
1. ✅ Stopped all Node.js processes
2. ✅ Verified files (currently not present - may have been quarantined)
3. ✅ Cleaned node_modules completely
4. ✅ Cleared pnpm cache
5. 🔄 Planning secure reinstallation with package verification

## Recommended npm Actions
1. **Immediate investigation** of these package versions
2. **Remove compromised versions** from npm registry
3. **Notify package maintainers** of potential account compromise
4. **Scan related packages** for similar malware
5. **Issue security advisory** to warn other users

## Contact Information
- **Reporter:** CODAI Ecosystem Development Team
- **Date:** July 18, 2025
- **Environment:** Windows Development Environment
- **Detection:** Windows Defender Antimalware

## Request
Please investigate these packages urgently as they pose a significant security risk to the entire npm ecosystem.
