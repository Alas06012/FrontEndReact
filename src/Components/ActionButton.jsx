import { BarChart2, Eye, RotateCcw } from 'lucide-react';

// Componente reutilizable para botones de acción (sin Tooltip externo)
const ActionButton = ({ 
  icon: Icon, 
  color = 'primary', 
  disabled = false, 
  onClick, 
  tooltip 
}) => {
  const colorClasses = {
    primary: 'text-blue-600 hover:text-blue-800',
    success: 'text-green-600 hover:text-green-800',
    danger: 'text-red-600 hover:text-red-800',
    warning: 'text-yellow-600 hover:text-yellow-800',
    info: 'text-purple-600 hover:text-purple-800',
    disabled: 'text-gray-400 cursor-not-allowed'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-1 rounded-md transition-colors ${
        disabled ? colorClasses.disabled : colorClasses[color]
      }`}
      title={tooltip}
      aria-label={tooltip}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export default ActionButton;