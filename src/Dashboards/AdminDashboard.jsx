import React, { useRef, useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { API_URL } from "../../config";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Card from "../Components/ui/card";

// Registrar los elementos de Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(`${API_URL}/admin-dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const result = await response.json();
        console.log(result);
        

        if (!response.ok) {
          throw new Error(result.message || "Error fetching dashboard data");
        }

        const raw = result.data;
        const data = {
          total_evaluated: raw.evaluated_students,
          average_score: raw.average_score,
          level_distribution: raw.level_distribution.map((item) => ({
            name: item.level,
            count: item.count,
          })),
          tests_by_day_data: {
            labels: raw.tests_by_day.map((t) => t.date),
            datasets: [
              {
                label: "Tests completados",
                data: raw.tests_by_day.map((t) => t.count),
                backgroundColor: "#60A5FA",
              },
            ],
          },
          approval_rate: raw.approval_rate,
          top_performers: raw.top_performers.map((p) => ({
            name: p.user_name,
            lastname: p.user_lastname,
            score: p.score,
          })),
          low_performers: raw.low_performers.map((p) => ({
            name: p.user_name,
            lastname: p.user_lastname,
            score: p.score,
          })),
          latest_evaluated: raw.latest_evaluated.map((s) => ({
            name: s.user_name,
            lastname: s.user_lastname,
            date: s.date,
            level: s.level || "N/A",
            score: s.score || 0,
          })),
        };

        setDashboardData(data);
      } catch (err) {
        console.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Destruir gráficos anteriores al actualizar
  useEffect(() => {
    return () => {
      if (barChartRef.current) {
        barChartRef.current.destroy();
      }
      if (pieChartRef.current) {
        pieChartRef.current.destroy();
      }
    };
  }, []);

  // Función para abrir el modal
  const openModal = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStudent(null);
  };

  if (loading) return <div className="text-center p-6">Loading...</div>;
  if (!dashboardData) return <div className="text-center p-6">No data available</div>;

  const stats = [
    { id: 1, name: "Evaluated Students", value: dashboardData.total_evaluated },
    { id: 2, name: "Global Average", value: dashboardData.average_score },
    { id: 3, name: "Approval Rate (%)", value: `${dashboardData.approval_rate}%` },
  ];

  const levelDistributionData = {
    labels: dashboardData.level_distribution.map((item) => item.name),
    datasets: [
      {
        data: dashboardData.level_distribution.map((item) => item.count),
        backgroundColor: ["#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6"],
      },
    ],
  };

  const testsByDayData = dashboardData.tests_by_day_data;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Stats Section */}
      <div className="bg-white py-12 sm:py-16 mx-auto max-w-7xl px-6 lg:px-8">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-10 sm:gap-y-12 lg:grid-cols-3 text-center">
          {stats.map((stat) => (
            <div key={stat.id} className="mx-auto flex max-w-xs flex-col gap-y-3">
              <dt className="text-base leading-7 text-gray-600">{stat.name}</dt>
              <dd className="order-first text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card title="Level Distribution" bgColor="bg-white">
          <Pie
            ref={pieChartRef}
            data={levelDistributionData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Level Distribution" },
              },
            }}
          />
        </Card>
        <Card title="Tests per Day (Last 7 Days)" bgColor="bg-white">
          <Bar
            ref={barChartRef}
            data={testsByDayData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Tests per Day (Last 7 Days)" },
              },
              scales: {
                x: { title: { display: true, text: "Date" } },
                y: { beginAtZero: true, title: { display: true, text: "Tests" } },
              },
            }}
          />
        </Card>
      </div>

      {/* Top performers */}
      <div className="relative overflow-x-auto shadow-md rounded-lg mt-6">
        <table className="w-full text-sm text-left text-gray-500">
          <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
            Top 5 Students
            <p className="mt-1 text-sm font-normal text-gray-500">
              List of the best-performing students based on their most recent scores.
            </p>
          </caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Lastname</th>
              <th scope="col" className="px-6 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.top_performers.map((student, idx) => (
              <tr key={idx} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {student.name}
                </th>
                <td className="px-6 py-4">{student.lastname}</td>
                <td className="px-6 py-4">{student.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Low performers */}
      <div className="relative overflow-x-auto shadow-md rounded-lg mt-6">
        <table className="w-full text-sm text-left text-gray-500">
          <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
           Bottom 5 Students
            <p className="mt-1 text-sm font-normal text-gray-500">
              List of the lowest-scoring students for prioritized attention.
            </p>
          </caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Lastname</th>
              <th scope="col" className="px-6 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.low_performers.map((student, idx) => (
              <tr key={idx} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {student.name}
                </th>
                <td className="px-6 py-4">{student.lastname}</td>
                <td className="px-6 py-4">{student.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Últimos evaluados */}
      <div className="relative overflow-x-auto shadow-md rounded-lg mt-6">
        <table className="w-full text-sm text-left text-gray-500">
          <caption className="p-5 text-lg font-semibold text-left text-gray-900 bg-white">
            Latest 5 Evaluated
            <p className="mt-1 text-sm font-normal text-gray-500">
              Log of the most recently evaluated students with their details.
            </p>
          </caption>
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Lastname</th>
              <th scope="col" className="px-6 py-3">Date</th>
              <th scope="col" className="px-6 py-3">Level</th>
              <th scope="col" className="px-6 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.latest_evaluated.map((student, idx) => (
              <tr key={idx} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                  {student.name}
                </th>
                <td className="px-6 py-4">{student.lastname}</td>
                <td className="px-6 py-4">{student.date}</td>
                <td className="px-6 py-4">{student.level}</td>
                <td className="px-6 py-4">{student.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && selectedStudent && (
        <div
          id="editUserModal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="relative w-full max-w-2xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <form className="relative bg-white rounded-lg shadow-md dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600 border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Editar estudiante
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  onClick={closeModal}
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-6 gap-6">
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="edit-name"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="edit-name"
                      id="edit-name"
                      value={selectedStudent.name}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          name: e.target.value,
                        })
                      }
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="edit-lastname"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="edit-lastname"
                      id="edit-lastname"
                      value={selectedStudent.lastname}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          lastname: e.target.value,
                        })
                      }
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="col-span-6 sm:col-span-3">
                    <label
                      htmlFor="edit-score"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Puntaje
                    </label>
                    <input
                      type="number"
                      name="edit-score"
                      id="edit-score"
                      value={selectedStudent.score}
                      onChange={(e) =>
                        setSelectedStudent({
                          ...selectedStudent,
                          score: parseInt(e.target.value),
                        })
                      }
                      className="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
              {/* Modal footer */}
              <div className="flex items-center p-6 space-x-3 rtl:space-x-reverse border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={closeModal}
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;