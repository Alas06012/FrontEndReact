// Componente de estado visual
const StatusBadge = ({ status }) => {
  const statusConfig = {
    COMPLETED: { color: 'bg-green-100 text-green-800', label: 'Completado' },
    PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pendiente' },
    IN_PROGRESS: { color: 'bg-blue-100 text-blue-800', label: 'En progreso' },
    default: { color: 'bg-gray-100 text-gray-800', label: status }
  };

  const { color, label } = statusConfig[status] || statusConfig.default;

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${color}`}>
      {label}
    </span>
  );
};

export default StatusBadge;