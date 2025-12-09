'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

type Point = { date: string; support: number; oppose: number };

export default function SupportOpposeChart({ points }: { points: Point[] }) {
  const data = {
    labels: points.map(p => p.date),
    datasets: [
      {
        label: '賛成',
        data: points.map(p => p.support),
        borderColor: 'rgb(34,197,94)',
        backgroundColor: 'rgba(34,197,94,0.3)',
        tension: 0.2,
      },
      {
        label: '反対',
        data: points.map(p => p.oppose),
        borderColor: 'rgb(239,68,68)',
        backgroundColor: 'rgba(239,68,68,0.3)',
        tension: 0.2,
      }
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };
  return <Line data={data} options={options} />;
}