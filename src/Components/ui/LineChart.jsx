import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export function LineChart({ data, title = "Line Chart", colors = ['#1c7ed6', '#228be6'] }) {
  const chartData = {
    labels: data.labels || [],
    datasets: data.datasets || [
      {
        label: 'Dataset 1',
        data: [],
        borderColor: colors[0],
        backgroundColor: `${colors[0]}50`, // Añade transparencia (50% opacidad)
        fill: false,
        tension: 0.1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Value',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  return <Line data={chartData} options={options} />;
}