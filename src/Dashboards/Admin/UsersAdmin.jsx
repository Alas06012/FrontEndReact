import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import Alert from "../../Components/Alert.jsx";
import { API_URL } from "/config.js";
import { getUserRole } from "../../Utils/auth.js";
import { User, Edit, XCircle, CheckCircle, Search, Plus } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { register: filterRegister, handleSubmit: handleFilterSubmit } =
    useForm();
  const navigate = useNavigate();

  // Verificar rol de admin
  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole === "admin") {
      fetchUsers();
    } else {
      Alert({
        title: "Access Denied",
        text: "You need admin privileges to access this page.",
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
      navigate("/dashboard/student");
    }
  }, [userRole, navigate]);

  // Función para obtener usuarios con filtros y paginación
  const fetchUsers = async (filters = {}, page = 1, per_page = 10) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        Alert({
          title: "Error",
          text: errorData.error || "Failed to fetch users",
          icon: "error",
          background: "#4b7af0",
          color: "white",
        });
      }
    } catch (error) {
      Alert({
        title: "Error",
        text: "Network error occurred",
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
    }
  };

  // Manejar filtros
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

  // Manejar creación/edición de usuarios
  const onUserSubmit = async (data) => {
    try {
      const endpoint = editUser ? "/users/edit" : "/users/create";
      const method = editUser ? "PUT" : "POST";
      const payload = editUser
        ? {
            name: data.name,
            lastname: data.lastname,
            carnet: data.carnet,
            role: data.role,
            current_email: editUser.user_email,
            new_email:
              data.email !== editUser.user_email ? data.email : undefined,
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
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        Alert({
          title: "Success",
          text: data.message,
          icon: "success",
          background: "#4b7af0",
          color: "white",
        });
        fetchUsers();
        setShowModal(false);
        reset();
        setEditUser(null);
      } else {
        const errorData = await response.json();
        Alert({
          title: "Error",
          text: errorData.error || "Operation failed",
          icon: "error",
          background: "#4b7af0",
          color: "white",
        });
      }
    } catch (error) {
      Alert({
        title: "Error",
        text: "Network error occurred",
        icon: "error",
        background: "#4b7af0",
        color: "white",
      });
    }
  };

  // Desactivar usuario
  const deactivateUser = async (user) => {
    const result = await Alert({
      title: "¿Estás seguro?",
      text: `¿Desea desactivar a ${user.user_name} ${user.user_lastname}?`,
      icon: "question",
      type: "confirm",
      confirmButtonText: "Sí, desactivar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      background: "#1e293b",
      color: "white",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/users/deactivate`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ email: user.user_email }),
        });
        if (response.ok) {
          const data = await response.json();
          Alert({
            title: "Éxito",
            text: data.message,
            icon: "success",
            background: "#1e293b",
            color: "white",
          });
          fetchUsers();
        } else {
          const errorData = await response.json();
          Alert({
            title: "Error",
            text: errorData.error || "No se pudo desactivar al usuario",
            icon: "error",
            background: "#1e293b",
            color: "white",
          });
        }
      } catch (error) {
        Alert({
          title: "Error",
          text: "Ocurrió un error de red",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }
    }
  };

  // Activar usuario
  const activateUser = async (user) => {
    const result = await Alert({
      title: "¿Estás seguro?",
      text: `¿Desea activar a ${user.user_name} ${user.user_lastname}?`,
      icon: "question",
      type: "confirm",
      confirmButtonText: "Sí, activar",
      cancelButtonText: "Cancelar",
      showCancelButton: true,
      background: "#1e293b",
      color: "white",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${API_URL}/users/activate`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({ email: user.user_email }),
        });
        if (response.ok) {
          const data = await response.json();
          Alert({
            title: "Éxito",
            text: data.message,
            icon: "success",
            background: "#1e293b",
            color: "white",
          });
          fetchUsers();
        } else {
          const errorData = await response.json();
          Alert({
            title: "Error",
            text: errorData.error || "No se pudo activar al usuario",
            icon: "error",
            background: "#1e293b",
            color: "white",
          });
        }
      } catch (error) {
        Alert({
          title: "Error",
          text: "Ocurrió un error de red",
          icon: "error",
          background: "#1e293b",
          color: "white",
        });
      }
    }
  };

  // Abrir modal para crear/editar
  const openModal = (user = null) => {
    setEditUser(user);
    if (user) {
      reset({
        name: user.user_name,
        lastname: user.user_lastname,
        carnet: user.user_carnet,
        email: user.user_email,
        role: user.user_role,
      });
    } else {
      reset({
        name: "",
        lastname: "",
        carnet: "",
        email: "",
        role: "student",
        password: "",
      });
    }
    setShowModal(true);
  };

  // Cambiar página
  const changePage = (page) => {
    fetchUsers({}, page);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">
          Administración de usuarios
        </h1>

        {/* Filtros */}

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-700">
            <Search className="h-5 w-5" /> Filters
          </h2>
          <form
            onSubmit={handleFilterSubmit(onFilterSubmit)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-gray-700">Email</label>
              <input
                type="text"
                {...filterRegister("email")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                placeholder="Filter by email"
              />
            </div>
            <div>
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                {...filterRegister("name")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                placeholder="Filter by name"
              />
            </div>
            <div>
              <label className="block text-gray-700">Lastname</label>
              <input
                type="text"
                {...filterRegister("lastname")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                placeholder="Filter by lastname"
              />
            </div>
            <div>
              <label className="block text-gray-700">Carnet</label>
              <input
                type="text"
                {...filterRegister("carnet")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                placeholder="Filter by carnet"
              />
            </div>
            <div>
              <label className="block text-gray-700">Role</label>
              <select
                {...filterRegister("role")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste"
              >
                <option value="">All</option>
                <option value="admin">Admin</option>
                <option value="student">Student</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700">Status</label>
              <select
                {...filterRegister("status")}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste"
              >
                <option value="">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out flex items-center gap-2"
              >
                <Search className="h-5 w-5" /> Apply Filters
              </button>
            </div>
          </form>
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
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Lastname
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Carnet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-Paleta-Blanco divide-y divide-gray-300">
              {users.map((user) => (
                <tr key={user.pk_user}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.pk_user}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.user_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.user_lastname}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.user_email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.user_carnet}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.user_role}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.status === "ACTIVE"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2">
                    <button
                      onClick={() => openModal(user)}
                      className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    {user.status === "ACTIVE" ? (
                      <button
                        onClick={() => deactivateUser(user)}
                        className="text-red-500 hover:text-red-700"
                        title="Deactivate"
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => activateUser(user)}
                        className="text-green-500 hover:text-green-700"
                        title="Activate"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="mt-4 flex justify-between items-center">
          <p className="text-sm text-gray-700">
            Showing {users.length} of {pagination.total_items} users
          </p>
          <div className="flex gap-2">
            {Array.from(
              { length: pagination.total_pages },
              (_, i) => i + 1
            ).map((page) => (
              <button
                key={page}
                onClick={() => changePage(page)}
                className={`px-3 py-1 rounded-md ${
                  pagination.current_page === page
                    ? "bg-Paleta-Celeste text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
          </div>
        </div>

        {/* Modal para crear/editar usuario */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="w-full max-w-sm bg-Paleta-Blanco rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-center mb-6 text-black">
                {editUser ? "Edit User" : "Create User"}
              </h2>
              <form onSubmit={handleSubmit(onUserSubmit)}>
                <div className="mb-4">
                  <label className="block text-gray-700">Nombre</label>
                  <input
                    type="text"
                    {...register("name", {
                      required: "El nombre es requerido",
                      pattern: {
                        value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                        message:
                          "El nombre solo puede contener letras y espacios",
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                    placeholder="Ingrese el nombre"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Apellido</label>
                  <input
                    type="text"
                    {...register("lastname", {
                      required: "El apellido es requerido",
                      pattern: {
                        value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
                        message:
                          "El apellido solo puede contener letras y espacios",
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                    placeholder="Ingrese el apellido"
                  />
                  {errors.lastname && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.lastname.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Carnet</label>
                  <input
                    type="text"
                    {...register("carnet", {
                      required: "El carnet es requerido",
                      pattern: {
                        value: /^[0-9]{6}$/,
                        message:
                          "El carnet debe contener exactamente 6 dígitos numéricos",
                      },
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                    placeholder="Ingrese el carnet"
                  />
                  {errors.carnet && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.carnet.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Correo</label>
                  <input
                    type="email"
                    {...register("email", {
                      required: "El correo es requerido",
                    })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                    placeholder="Ingrese el correo"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                <div className="mb-4">
                  <label className="block text-gray-700">Rol</label>
                  <select
                    {...register("role", { required: "El rol es requerido" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste"
                  >
                    <option value="student">Estudiante</option>
                    <option value="admin">Administrador</option>
                  </select>
                  {errors.role && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.role.message}
                    </p>
                  )}
                </div>
                {!editUser && (
                  <div className="mb-4">
                    <label className="block text-gray-700">Contraseña</label>
                    <input
                      type="password"
                      {...register("password", {
                        required: "La contraseña es requerida",
                        minLength: {
                          value: 6,
                          message:
                            "La contraseña debe tener al menos 6 caracteres",
                        },
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-Paleta-Celeste focus:border-Paleta-Celeste placeholder-gray-500"
                      placeholder="Ingrese la contraseña"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      reset({
                        name: "",
                        lastname: "",
                        carnet: "",
                        email: "",
                        role: "student",
                        password: "",
                      });
                      setEditUser(null);
                    }}
                    className="py-2 px-4 bg-gray-300 text-gray-700 font-semibold rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out"
                  >
                    {editUser ? "Actualizar" : "Crear"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
