'use client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend,
} from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function FundingChart({ summary }: { summary: Record<string, number> }) {
  const labels = Object.keys(summary);
  const dataValues = labels.map(l => summary[l]);

  return (
    <div className="w-full">
      <Bar
        data={{
          labels,
          datasets: [{
            label: '金額(円)',
            data: dataValues,
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
          }],
        }}
        options={{
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { ticks: { color: '#334155' } }, x: { ticks: { color: '#334155' } } }
        }}
      />
    </div>
  );
}