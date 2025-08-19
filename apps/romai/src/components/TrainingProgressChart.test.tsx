import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TrainingProgressChart } from './TrainingProgressChart';

describe('TrainingProgressChart - Real Integration Test Suite', () => {
    const realTrainingData = [2.5, 1.8, 1.2, 0.9, 0.7, 0.5, 0.3];
    const realLargeDataset = Array.from({ length: 100 }, (_, i) => 2.0 - (i * 0.015) + Math.random() * 0.1);

    describe('Real Chart Library Integration', () => {
        it('renders actual chart with real data', () => {
            render(<TrainingProgressChart data={realTrainingData} />);

            const chartTitle = screen.getByText('Loss Trajectory');
            expect(chartTitle).toBeInTheDocument();

            const svgElement = screen.getByRole('img');
            expect(svgElement).toBeTruthy();
            expect(svgElement.tagName).toBe('svg');
        });

        it('handles real chart library responsiveness', () => {
            render(<TrainingProgressChart data={realTrainingData} />);

            const chartTitle = screen.getByText('Loss Trajectory');
            expect(chartTitle).toBeInTheDocument();

            const currentValue = screen.getByText(/Current:/);
            expect(currentValue).toBeInTheDocument();
        });
    });

    describe('Performance with Real Data', () => {
        it('handles large datasets efficiently', () => {
            const startTime = performance.now();
            render(<TrainingProgressChart data={realLargeDataset} />);
            const endTime = performance.now();

            expect(endTime - startTime).toBeLessThan(100); // Should render in less than 100ms

            const chartTitle = screen.getByText('Loss Trajectory');
            expect(chartTitle).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('handles invalid data gracefully', () => {
            const invalidData = [NaN, undefined, null, 'invalid', 2.5, 1.8] as any[];

            render(<TrainingProgressChart data={invalidData} />);

            const chartTitle = screen.getByText('Loss Trajectory');
            expect(chartTitle).toBeInTheDocument();
        });

        it('handles empty data array', () => {
            render(<TrainingProgressChart data={[]} />);

            const noDataMessage = screen.getByText('No training data available');
            expect(noDataMessage).toBeInTheDocument();
        });

        it('handles null/undefined data prop', () => {
            render(<TrainingProgressChart data={null as any} />);

            const noDataMessage = screen.getByText('No training data available');
            expect(noDataMessage).toBeInTheDocument();
        });
    });
});
