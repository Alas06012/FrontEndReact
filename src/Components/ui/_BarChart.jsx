import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function BarChart({
  data,
  dataKey = "count", // Clave de datos (por defecto 'count', puede ser 'score')
  title = "Distribution Chart",
  xAxisLabel = "Categories",
  yAxisLabel = "Values",
  colors = {
    background: "rgba(28, 126, 214, 0.5)",
    border: "#1c7ed6",
  },
}) {
  const chartData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: `${yAxisLabel} per ${xAxisLabel}`,
        data: data.map((item) => item[dataKey]),
        borderColor: colors.border,
        backgroundColor: colors.background,
        borderWidth: 2,
        borderRadius: 5,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
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
          text: yAxisLabel,
        },
        ticks: {
          stepSize: 1,
          callback: function (value) {
            return Number.isInteger(value) ? value : null;
          },
        },
      },
      x: {
        title: {
          display: true,
          text: xAxisLabel,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
}