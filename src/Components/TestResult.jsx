// Componente de resultado de test
const TestResult = ({ passed }) => {
  if (passed === 1) return <span className="text-green-600 font-medium">Aprobado</span>;
  if (passed === 0) return <span className="text-red-600 font-medium">Reprobado</span>;
  return <span className="text-gray-500">Pendiente</span>;
};

export default TestResult;