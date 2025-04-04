// Alert.js
import Swal from 'sweetalert2';

const Alert = ({ title, text, icon, background, color }) => {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    toast: true,
    position: 'top',
    iconColor: 'white',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: background,
    color: color,
  });
};

export default Alert;