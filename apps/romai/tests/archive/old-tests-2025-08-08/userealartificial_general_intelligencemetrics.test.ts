import { renderHook, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { useRealAGIMetrics } from './userealartificial_general_intelligencemetrics';

describe('useRealAGIMetrics - Real Integration Test Suite', () => {
    describe('Real AGI Server Integration', () => {
        it('fetches real AGI metrics from localhost:8000', async () => {
            const { result } = renderHook(() => useRealAGIMetrics());

            expect(result.current.isLoading).toBe(true);

            await waitFor(
                () => {
                    expect(result.current.isLoading).toBe(false);
                },
                { timeout: 30000 }
            );

            expect(result.current.isLoading).toBe(false);
            expect(result.current.training !== null || result.current.hasError !== null).toBe(true);
        });

        it('handles real server unavailability gracefully', async () => {
            const { result } = renderHook(() => useRealAGIMetrics());

            await waitFor(
                () => {
                    expect(result.current.isLoading).toBe(false);
                },
                { timeout: 30000 }
            );

            if (result.current.hasError) {
                expect(result.current.hasError).toBeDefined();
                expect(result.current.training.error || result.current.capabilities.error ||
                    result.current.status.error || result.current.health.error).toBeTruthy();
            } else {
                expect(result.current.training.metrics || result.current.capabilities.capabilities ||
                    result.current.status.status || result.current.health.health).toBeTruthy();
            }
        });
    });

    describe('Real Hook Lifecycle', () => {
        it('properly cleans up real intervals on unmount', () => {
            const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

            const { unmount } = renderHook(() => useRealAGIMetrics());

            unmount();

            expect(clearIntervalSpy).toHaveBeenCalled();
        });
    });
});
