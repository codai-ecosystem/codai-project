---
name: Final Quality Improvements
about: Address remaining quality issues found during health check
title:
  'chore: final quality improvements - metadata, imports, typing, and UI fixes'
labels: ['enhancement', 'code quality', 'maintenance']
assignees: ''
---

## Description

During the final comprehensive health check of the METU Template, several
quality issues were identified that need to be addressed to achieve a completely
clean project state.

## Issues Found

### 🚨 High Priority

1. **Next.js Metadata Configuration Warnings**

   - Multiple console warnings about viewport/colorScheme/themeColor being in
     wrong export
   - Should be moved from metadata export to viewport export

2. **TypeScript Quality Issue**

   - One explicit `any` type in `src/lib/firebase-unified.ts:504`
   - Violates project's "no any types" policy

3. **UI Content Duplication**
   - Register page shows duplicate "Terms of Service" text
   - Affects user experience

### 📝 Medium Priority

4. **Import Order Lint Warnings**

   - Multiple files have import order violations
   - 15+ files affected across components, hooks, and providers

5. **NextUI Deprecation Warnings**

   - Console warnings about onClick vs onPress deprecation
   - Need to update to modern NextUI patterns

6. **Firebase Emulator Configuration**
   - Warning about missing import/export metadata file
   - Affects development workflow

### 🔧 Low Priority

7. **Turbo Configuration Warnings**

   - Missing outputs configuration for some tasks
   - Affects build caching efficiency

8. **Resource 404 Errors**
   - Browser console shows 404s for some resources
   - Minor but affects development experience

## Implementation Plan

A detailed implementation plan has been created in
`.github/plans/final-quality-improvements.md` with:

- ✅ Specific solutions for each issue
- ⏱️ Estimated time: 2 hours total
- 📋 Step-by-step implementation phases
- ✔️ Success criteria and validation steps

## Acceptance Criteria

- [ ] No TypeScript errors
- [ ] No lint warnings
- [ ] Clean build with no warnings
- [ ] All tests passing
- [ ] No browser console errors/warnings
- [ ] Clean emulator startup
- [ ] UI content is consistent and correct
- [ ] Proper metadata configuration following Next.js 15 best practices

## Testing Requirements

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Manual UI/UX validation
- [ ] Browser console verification (no errors/warnings)
- [ ] Firebase emulator functionality check

## Related Files

### Files to Update:

- `app/layout.tsx` (metadata configuration)
- `src/lib/firebase-unified.ts` (remove any type)
- `src/app/auth/register/page.tsx` (fix duplicate content)
- `turbo.json` (add missing outputs)
- 15+ files with import order issues

### Files to Review:

- Firebase seed configuration
- NextUI component usage
- Resource loading configuration

## Labels

- `enhancement`
- `code quality`
- `maintenance`

---

**Note**: This issue addresses the final quality improvements needed to achieve
a completely clean and professional codebase. All checks currently pass
functionally, but these improvements will eliminate warnings and enhance
developer experience.
