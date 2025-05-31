// Alert.js
import Swal from 'sweetalert2';

const Alert = ({
  title = '',
  text = '',
  icon = 'info',
  background = '#1e293b', // slate-800 (valor por defecto)
  color = 'white',
  // Nuevas props (opcionales)
  type, // undefined = comportamiento original
  confirmButtonText = 'Yes',
  cancelButtonText = 'No',
  showCancelButton = true
}) => {
  // Configuración base (compatible con tu uso actual)
  const baseConfig = {
    title,
    text,
    icon,
    background,
    color,
    iconColor: 'white',
  };

  // Nuevos comportamientos (opcionales)
  if (type === 'confirm') {
    // Diálogo de confirmación
    return Swal.fire({
      ...baseConfig,
      showCancelButton,
      confirmButtonText,
      cancelButtonText,
      confirmButtonColor: '#4f46e5', // indigo-600
      cancelButtonColor: '#ef4444', // red-500
    });
  }

  if (type === 'toast') {
    // Toast con personalización extra
    return Swal.fire({
      ...baseConfig,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  // Comportamiento ORIGINAL (si no se especifica 'type')
  if (!type) {
    return Swal.fire({
      ...baseConfig,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }

  // Fallback por si se pasa un type desconocido (retorna alert básico)
  return Swal.fire(baseConfig);
};

export default Alert;
