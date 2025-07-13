'use client';

import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
  }>;
}

interface ChartProps {
  data: ChartData;
  title?: string;
  height?: number;
  className?: string;
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const pieOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
    },
  },
};

export function LineChart({
  data,
  title,
  height = 300,
  className = '',
}: ChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <Line data={data} options={chartOptions} />
      </div>
    </div>
  );
}

export function BarChart({
  data,
  title,
  height = 300,
  className = '',
}: ChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <Bar data={data} options={chartOptions} />
      </div>
    </div>
  );
}

export function PieChart({
  data,
  title,
  height = 300,
  className = '',
}: ChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <Pie data={data} options={pieOptions} />
      </div>
    </div>
  );
}

export function DoughnutChart({
  data,
  title,
  height = 300,
  className = '',
}: ChartProps) {
  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <Doughnut data={data} options={pieOptions} />
      </div>
    </div>
  );
}

export function AreaChart({
  data,
  title,
  height = 300,
  className = '',
}: ChartProps) {
  const areaData = {
    ...data,
    datasets: data.datasets.map(dataset => ({
      ...dataset,
      fill: true,
      backgroundColor: dataset.backgroundColor || 'rgba(59, 130, 246, 0.1)',
      borderColor: dataset.borderColor || 'rgb(59, 130, 246)',
    })),
  };

  return (
    <div className={`w-full ${className}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <div style={{ height: `${height}px` }}>
        <Line data={areaData} options={chartOptions} />
      </div>
    </div>
  );
}
