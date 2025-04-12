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
  confirmButtonText = 'Sí',
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

  // Nuevos comportamientos (opcionales)
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
};

export default Alert;