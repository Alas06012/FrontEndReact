import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function ChartJSLine({ data }) {
  const chartData = {
    labels: data.map((d) => d.name),
    datasets: [
      {
        label: 'Score',
        data: data.map((d) => d.score),
        fill: false,
        borderColor: '#1c7ed6',
        tension: 0.3,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        min: 10,
        max: 990,
        ticks: {
          stepSize: 100,
        },
      },
    },
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return <Line data={chartData} options={options} />;
}


/*
import { ResponsiveLine } from '@nivo/line';

export function NivoLine({ data }) {
  const formattedData = [
    {
      id: 'Score',
      color: '#1c7ed6',
      data: data.map((d, i) => ({
        x: d.name,
        y: d.score,
      })),
    },
  ];

  return (
    <div style={{ height: 250 }}>
      <ResponsiveLine
        data={formattedData}
        margin={{ top: 20, right: 20, bottom: 40, left: 40 }}
        xScale={{ type: 'point' }}
        yScale={{ type: 'linear', min: 400, max: 700, stacked: false }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          orient: 'bottom',
          legend: 'Test #',
          legendOffset: 30,
          legendPosition: 'middle',
        }}
        axisLeft={{
          orient: 'left',
          legend: 'Score',
          legendOffset: -30,
          legendPosition: 'middle',
        }}
        pointSize={6}
        pointColor="#1c7ed6"
        pointBorderWidth={1}
        enableArea={true}
        colors={{ datum: 'color' }}
        useMesh={true}
      />
    </div>
  );
}*/


 