# Archived Fake Tests

This directory contains the original test files that used mocked data and hardcoded values instead of real AGI testing.

## Archived Files:
- `components.test.tsx.archived` - Original frontend component tests with mocked AGI client

## Reason for Archival:
These tests were replaced with comprehensive real AGI testing that follows Microsoft AI evaluation standards:
- Groundedness
- Relevance  
- Coherence
- Fluency
- Safety metrics
- Real API integration without hardcoded values

## New Test Location:
Real AGI tests are now located in:
- `tests/frontend/real-agi-components.test.tsx`
- `tests/backend/real_agi_microsoft_standards.py` 
- `tests/integration/real_agi_integration.py`
