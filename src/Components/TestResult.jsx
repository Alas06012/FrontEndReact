// Componente de resultado de test
const TestResult = ({ passed }) => {
  if (passed === 1) return <span className="text-green-600 font-medium">Passed</span>;
  if (passed === 0) return <span className="text-red-600 font-medium">Failed</span>;
  return <span className="text-gray-500">Pending</span>;
};

export default TestResult;