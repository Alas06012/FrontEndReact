import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Alert from '../../Components/Alert.jsx';
import { API_URL } from '/config.js';
import { getUserRole } from '../../Utils/auth.js';
import { User, Edit, XCircle, CheckCircle, Search, Plus } from 'lucide-react';
import Table from '../../Components/Table.jsx';
import Form from '../../Components/Form.jsx';
import Modal from '../../Components/Modal.jsx';
import Pagination from '../../Components/Pagination.jsx';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(10); // Estado para la cantidad de registros por página
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const navigate = useNavigate();
  const filterFormRef = useRef();

  // Solo un useForm para el formulario de creación/edición
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Verificar rol de admin
  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole === 'admin') {
      fetchUsers();
    } else {
      Alert({
        title: 'Access Denied',
        text: 'You need admin privileges to access this page.',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      navigate('/dashboard/student');
    }
  }, [userRole, navigate]);

  const fetchUsers = async (filters = {}, page = 1, per_page = perPage) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination({
          total_items: data.pagination?.total_items || 0,
          total_pages: data.pagination?.total_pages || 1,
          current_page: data.pagination?.current_page || 1,
        });
        console.log('Pagination data:', {
          total_items: data.pagination?.total_items,
          total_pages: data.pagination?.total_pages,
          current_page: data.pagination?.current_page,
          per_page: per_page,
        });
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Failed to fetch users',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        setUsers([]);
        setPagination({
          total_items: 0,
          total_pages: 1,
          current_page: 1,
        });
      }
    } catch (error) {
      Alert({
        title: 'Error',
        text: 'Network error occurred',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      setUsers([]);
      setPagination({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
      });
    }
  };

  const onFilterSubmit = (data) => {
    const filters = {
      user_email: data.email,
      user_name: data.name,
      user_lastname: data.lastname,
      user_carnet: data.carnet,
      user_role: data.role,
      status: data.status,
    };
    fetchUsers(filters);
  };

  const onUserSubmit = async (data) => {
    try {
      const endpoint = editUser ? '/users/edit' : '/users/create';
      const method = editUser ? 'PUT' : 'POST';
      const payload = editUser
        ? {
            name: data.name,
            lastname: data.lastname,
            carnet: data.carnet,
            role: data.role,
            current_email: editUser.user_email,
            new_email: data.email !== editUser.user_email ? data.email : undefined,
          }
        : {
            name: data.name,
            lastname: data.lastname,
            carnet: data.carnet,
            email: data.email,
            role: data.role,
            password: data.password,
          };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        Alert({
          title: 'Success',
          text: data.message,
          icon: 'success',
          background: '#4b7af0',
          color: 'white',
        });
        fetchUsers();
        setShowModal(false);
        setEditUser(null);
      } else {
        const errorData = await response.json();
        Alert({
          title: 'Error',
          text: errorData.error || 'Operation failed',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
      }
    } catch (error) {
      Alert({
        title: 'Error',
        text: 'Network error occurred',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
    }
  };

  const deactivateUser = async (user) => {
    const result = await Alert({
      title: '¿Estás seguro?',
      text: `¿Desea desactivar a ${user.user_name} ${user.user_lastname}?`,
      icon: 'question',
      type: 'confirm',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/users/deactivate`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ email: user.user_email }),
        });
        if (response.ok) {
          const data = await response.json();
          Alert({
            title: 'Éxito',
            text: data.message,
            icon: 'success',
            background: '#1e293b',
            color: 'white',
          });
          fetchUsers();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'No se pudo desactivar al usuario',
            icon: 'error',
            background: '#1e293b',
            color: 'white',
          });
        }
      } catch (error) {
        Alert({
          title: 'Error',
          text: 'Ocurrió un error de red',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
      }
    }
  };

  const activateUser = async (user) => {
    const result = await Alert({
      title: '¿Estás seguro?',
      text: `¿Desea activar a ${user.user_name} ${user.user_lastname}?`,
      icon: 'question',
      type: 'confirm',
      confirmButtonText: 'Sí, activar',
      cancelButtonText: 'Cancelar',
      showCancelButton: true,
      background: '#1e293b',
      color: 'white',
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/users/activate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ email: user.user_email }),
        });
        if (response.ok) {
          const data = await response.json();
          Alert({
            title: 'Éxito',
            text: data.message,
            icon: 'success',
            background: '#1e293b',
            color: 'white',
          });
          fetchUsers();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'No se pudo activar al usuario',
            icon: 'error',
            background: '#1e293b',
            color: 'white',
          });
        }
      } catch (error) {
        Alert({
          title: 'Error',
          text: 'Ocurrió un error de red',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
      }
    }
  };

  const openModal = (user = null) => {
    setEditUser(user);
    setShowModal(true);
  };

  const changePage = (page) => {
    fetchUsers({}, page);
  };

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchUsers({}, 1, newPerPage); // Recarga desde la página 1 con el nuevo per_page
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'ID', key: 'pk_user' },
    { header: 'Name', key: 'user_name' },
    { header: 'Lastname', key: 'user_lastname' },
    { header: 'Email', key: 'user_email' },
    { header: 'Carnet', key: 'user_carnet' },
    { header: 'Role', key: 'user_role' },
    {
      header: 'Status',
      render: (item) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.status}
        </span>
      ),
    },
  ];

  // Configuración de campos para el formulario de creación/edición
  const formFields = [
    { name: 'name', label: 'Nombre', validation: { required: 'El nombre es requerido', pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, message: 'El nombre solo puede contener letras y espacios' } } },
    { name: 'lastname', label: 'Apellido', validation: { required: 'El apellido es requerido', pattern: { value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/, message: 'El apellido solo puede contener letras y espacios' } } },
    { name: 'carnet', label: 'Carnet', validation: { required: 'El carnet es requerido', pattern: { value: /^[0-9]{6}$/, message: 'El carnet debe contener exactamente 6 dígitos numéricos' } } },
    { name: 'email', label: 'Correo', type: 'email', validation: { required: 'El correo es requerido' } },
    { name: 'role', label: 'Rol', type: 'select', options: [{ value: 'student', label: 'Estudiante' }, { value: 'admin', label: 'Administrador' }], validation: { required: 'El rol es requerido' } },
  ];

  const filterFields = [
    { name: 'email', label: 'Email', type: 'text' },
    { name: 'name', label: 'Name', type: 'text' },
    { name: 'lastname', label: 'Lastname', type: 'text' },
    { name: 'carnet', label: 'Carnet', type: 'text' },
    { name: 'role', label: 'Role', type: 'select', options: [{ value: '', label: 'All' }, { value: 'admin', label: 'Admin' }, { value: 'student', label: 'Student' }] },
    { name: 'status', label: 'Status', type: 'select', options: [{ value: '', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }] },
  ];

  const filterInitialData = {
    email: '',
    name: '',
    lastname: '',
    carnet: '',
    role: '',
    status: '',
  };

  const actionRender = (user) => (
    <div className="flex gap-2">
      <button onClick={() => openModal(user)} className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave" title="Edit">
        <Edit className="h-5 w-5" />
      </button>
      {user.status === 'ACTIVE' ? (
        <button onClick={() => deactivateUser(user)} className="text-red-500 hover:text-red-700" title="Deactivate">
          <XCircle className="h-5 w-5" />
        </button>
      ) : (
        <button onClick={() => activateUser(user)} className="text-green-500 hover:text-green-700" title="Activate">
          <CheckCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  const clearFilters = () => {
    fetchUsers(); // Recarga la lista sin filtros
    filterFormRef.current?.reset(); // Limpia los campos del formulario
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Administración de usuarios</h1>

        {/* Filtros */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <Search className="h-5 w-5" /> Filters
          </h2>
          <Form
            ref={filterFormRef}
            fields={filterFields}
            onSubmit={onFilterSubmit}
            initialData={filterInitialData}
            submitText="Apply Filters"
            layout="grid-cols-1 md:grid-cols-3"
            onCancel={clearFilters}
            cancelText="Limpiar filtros"
          />
        </div>

        {/* Botón para crear usuario */}
        <div className="mb-6 text-center">
          <button
            onClick={() => openModal()}
            className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" /> Create User
          </button>
        </div>

        {/* Tabla de usuarios */}
        <Table columns={tableColumns} data={users} onAction={actionRender} />

        {/* Paginación con selector de registros por página */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
          perPage={perPage}
          setPerPage={setPerPage}
          onPerPageChange={handlePerPageChange}
        />

        {/* Modal para crear/editar usuario */}
        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditUser(null); }} title={editUser ? 'Edit User' : 'Create User'}>
          <Form
            fields={formFields.concat(!editUser ? [{ name: 'password', label: 'Contraseña', type: 'password', validation: { required: 'La contraseña es requerida', minLength: { value: 6, message: 'La contraseña debe tener al menos 6 caracteres' } } }] : [])}
            onSubmit={onUserSubmit}
            initialData={editUser ? {
              name: editUser.user_name,
              lastname: editUser.user_lastname,
              carnet: editUser.user_carnet,
              email: editUser.user_email,
              role: editUser.user_role,
            } : {
              name: '',
              lastname: '',
              carnet: '',
              email: '',
              role: 'student',
              password: '',
            }}
            onCancel={() => { setShowModal(false); setEditUser(null); }}
            submitText={editUser ? 'Actualizar' : 'Crear'}
            layout="grid-cols-1"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Users;