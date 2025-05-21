# Tutorial: Implementación de Componentes Reutilizables en un Módulo de Materias de Estudio

Este tutorial te guiará paso a paso para implementar un conjunto de componentes reutilizables (`Table`, `Form`, `Modal`, `Pagination`) en un nuevo módulo de React, utilizando como ejemplo un módulo de **Materias de Estudio** (`Subjects.jsx`). Estos componentes fueron diseñados para ser flexibles y fáciles de integrar en cualquier módulo que necesite listar, filtrar, crear, editar y gestionar datos con paginación.

## Prerrequisitos

Antes de comenzar, asegúrate de tener lo siguiente configurado en tu proyecto:

- **React**: Un proyecto de React configurado (puedes usar Vite o Create React App).
- **Lucide React**: Íconos para los botones y acciones (`npm install lucide-react`).
- **React Hook Form**: Para manejar formularios (`npm install react-hook-form`).
- **React Router DOM**: Para la navegación (`npm install react-router-dom`).
- **SweetAlert2**: Para mostrar alertas (usado en el componente `Alert.jsx`, `npm install sweetalert2`).
- **Tailwind CSS** (opcional): Los estilos están escritos con Tailwind CSS. Si no usas Tailwind, ajusta las clases CSS según tu framework o estilos personalizados.
- **Backend API**: Un backend que proporcione endpoints para listar, crear, editar, y gestionar las materias (por ejemplo, `/subjects` para listar materias con filtros y paginación).

## Estructura del Proyecto

Asegúrate de que los componentes reutilizables estén en la carpeta `src/Components/` y que tengas una estructura similar a esta:

```
src/
  Components/
    Alert.jsx
    Table.jsx
    Form.jsx
    Modal.jsx
    Pagination.jsx
  Pages/
    Users.jsx
    Subjects.jsx  # Nuevo módulo que vamos a crear
  Utils/
    auth.js      # Para manejar roles de usuario (por ejemplo, `getUserRole`)
  config.js      # Configuración de la URL del API (por ejemplo, `API_URL`)
```

## Componentes Reutilizables

A continuación, se describen los componentes que usaremos y cómo funcionan:

1. **Table.jsx**:
   - Muestra datos en una tabla.
   - Props:
     - `columns`: Array de objetos que define las columnas (`{ header: 'Nombre', key: 'subject_name' }` o con `render` para personalizar).
     - `data`: Array de datos a mostrar.
     - `onAction`: Función para renderizar acciones (por ejemplo, botones de "Editar" o "Eliminar").
   - Uso: Ideal para listar datos como materias, usuarios, etc.

2. **Form.jsx**:
   - Genera formularios dinámicos con validaciones.
   - Props:
     - `fields`: Array de objetos que define los campos (`{ name: 'subject_name', label: 'Nombre', validation: { required: 'Requerido' } }`).
     - `onSubmit`: Función que se ejecuta al enviar el formulario.
     - `initialData`: Datos iniciales para prellenar el formulario.
     - `onCancel`: Función para cancelar (por ejemplo, cerrar un modal).
     - `submitText`: Texto del botón de envío.
     - `layout`: Clases CSS para el diseño del formulario (por ejemplo, `grid-cols-1`).
     - `cancelText`: Texto del botón de cancelar.
   - Uso: Para crear o editar registros (por ejemplo, una materia).

3. **Modal.jsx**:
   - Muestra un modal para formularios o contenido.
   - Props:
     - `isOpen`: Booleano para mostrar u ocultar el modal.
     - `onClose`: Función para cerrar el modal.
     - `title`: Título del modal.
     - `children`: Contenido del modal (por ejemplo, un formulario).
   - Uso: Para formularios de creación o edición.

4. **Pagination.jsx**:
   - Maneja la paginación y la selección de registros por página.
   - Props:
     - `currentPage`: Página actual.
     - `totalPages`: Total de páginas.
     - `onPageChange`: Función para cambiar de página.
     - `perPage`: Número de registros por página.
     - `onPerPageChange`: Función para manejar el cambio de `perPage`.
   - Uso: Para navegar entre páginas y ajustar la cantidad de registros mostrados.

## Ejemplo: Módulo de Materias de Estudio (`Subjects.jsx`)

Vamos a crear un módulo para gestionar materias de estudio. Este módulo permitirá listar materias, filtrarlas, crear nuevas materias, editarlas, y activar/desactivar su estado. Usaremos los componentes reutilizables para lograr esto.

### Código de `Subjects.jsx`

Crea un nuevo archivo `src/Pages/Subjects.jsx` y copia el siguiente código:

```jsx
import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Alert from '../Components/Alert.jsx';
import { API_URL } from '/config.js';
import { getUserRole } from '../Utils/auth.js';
import { BookOpen, Edit, XCircle, CheckCircle, Search, Plus } from 'lucide-react';
import Table from '../Components/Table.jsx';
import Form from '../Components/Form.jsx';
import Modal from '../Components/Modal.jsx';
import Pagination from '../Components/Pagination.jsx';

// Componente principal para gestionar materias
const Subjects = () => {
  const [subjects, setSubjects] = useState([]); // Lista de materias
  const [pagination, setPagination] = useState({
    total_items: 0,
    total_pages: 1,
    current_page: 1,
  });
  const [perPage, setPerPage] = useState(10); // Registros por página
  const [showModal, setShowModal] = useState(false); // Estado del modal
  const [editSubject, setEditSubject] = useState(null); // Materia en edición
  const navigate = useNavigate();
  const filterFormRef = useRef();

  // Hook Form para el formulario de creación/edición
  const { handleSubmit } = useForm();

  // Verificar rol de admin
  const userRole = getUserRole()?.toLowerCase();
  useEffect(() => {
    if (userRole === 'admin') {
      fetchSubjects();
    } else {
      Alert({
        title: 'Access Denied',
        text: 'You need admin privileges to access this page.',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      navigate('/dashboard/' + userRole);
    }
  }, [userRole, navigate]);

  // Función para obtener las materias desde el backend
  const fetchSubjects = async (filters = {}, page = 1, per_page = perPage) => {
    try {
      const response = await fetch(`${API_URL}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ ...filters, page, per_page }),
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects || []);
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
          text: errorData.error || 'Failed to fetch subjects',
          icon: 'error',
          background: '#4b7af0',
          color: 'white',
        });
        setSubjects([]);
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
      setSubjects([]);
      setPagination({
        total_items: 0,
        total_pages: 1,
        current_page: 1,
      });
    }
  };

  // Manejar el envío del formulario de filtros
  const onFilterSubmit = (data) => {
    const filters = {
      subject_name: data.name,
      status: data.status,
    };
    fetchSubjects(filters);
  };

  // Manejar el envío del formulario de creación/edición
  const onSubjectSubmit = async (data) => {
    try {
      const endpoint = editSubject ? '/subjects/edit' : '/subjects/create';
      const method = editSubject ? 'PUT' : 'POST';
      const payload = editSubject
        ? {
            name: data.name,
            current_name: editSubject.subject_name,
          }
        : {
            name: data.name,
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
        fetchSubjects();
        setShowModal(false);
        setEditSubject(null);
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

  // Desactivar una materia
  const deactivateSubject = async (subject) => {
    const result = await Alert({
      title: '¿Estás seguro?',
      text: `¿Desea desactivar la materia ${subject.subject_name}?`,
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
        const response = await fetch(`${API_URL}/subjects/deactivate`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ name: subject.subject_name }),
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
          fetchSubjects();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'No se pudo desactivar la materia',
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

  // Activar una materia
  const activateSubject = async (subject) => {
    const result = await Alert({
      title: '¿Estás seguro?',
      text: `¿Desea activar la materia ${subject.subject_name}?`,
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
        const response = await fetch(`${API_URL}/subjects/activate`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify({ name: subject.subject_name }),
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
          fetchSubjects();
        } else {
          const errorData = await response.json();
          Alert({
            title: 'Error',
            text: errorData.error || 'No se pudo activar la materia',
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

  // Abrir el modal para crear o editar
  const openModal = (subject = null) => {
    setEditSubject(subject);
    setShowModal(true);
  };

  // Cambiar de página
  const changePage = (page) => {
    fetchSubjects({}, page);
  };

  // Manejar el cambio de registros por página
  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchSubjects({}, 1, newPerPage);
  };

  // Configuración de columnas para la tabla
  const tableColumns = [
    { header: 'ID', key: 'pk_subject' },
    { header: 'Nombre', key: 'subject_name' },
    {
      header: 'Status',
      render: (item) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {item.status}
        </span>
      ),
    },
  ];

  // Configuración de campos para el formulario de creación/edición
  const formFields = [
    {
      name: 'name',
      label: 'Nombre de la Materia',
      validation: {
        required: 'El nombre es requerido',
        pattern: {
          value: /^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/,
          message: 'El nombre solo puede contener letras y espacios',
        },
      },
    },
  ];

  // Configuración de campos para el formulario de filtros
  const filterFields = [
    { name: 'name', label: 'Nombre', type: 'text' },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { value: '', label: 'All' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'INACTIVE', label: 'Inactive' },
      ],
    },
  ];

  const filterInitialData = {
    name: '',
    status: '',
  };

  // Renderizar acciones (editar, activar/desactivar)
  const actionRender = (subject) => (
    <div className="flex gap-2">
      <button
        onClick={() => openModal(subject)}
        className="text-Paleta-Celeste hover:text-Paleta-VerdeSuave"
        title="Edit"
      >
        <Edit className="h-5 w-5" />
      </button>
      {subject.status === 'ACTIVE' ? (
        <button
          onClick={() => deactivateSubject(subject)}
          className="text-red-500 hover:text-red-700"
          title="Deactivate"
        >
          <XCircle className="h-5 w-5" />
        </button>
      ) : (
        <button
          onClick={() => activateSubject(subject)}
          className="text-green-500 hover:text-green-700"
          title="Activate"
        >
          <CheckCircle className="h-5 w-5" />
        </button>
      )}
    </div>
  );

  // Limpiar filtros
  const clearFilters = () => {
    fetchSubjects();
    filterFormRef.current?.reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-Paleta-GrisClaro">
      <div className="w-full max-w-6xl bg-Paleta-Blanco rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-center mb-6 text-black">Administración de Materias</h1>

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
            layout="grid-cols-1 md:grid-cols-2"
            onCancel={clearFilters}
            cancelText="Limpiar filtros"
          />
        </div>

        {/* Botón para crear materia */}
        <div className="mb-6 text-center">
          <button
            onClick={() => openModal()}
            className="py-2 px-4 bg-Paleta-Celeste text-white font-semibold rounded-md hover:bg-Paleta-VerdeSuave transition duration-300 ease-in-out flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" /> Create Subject
          </button>
        </div>

        {/* Tabla de materias */}
        <Table columns={tableColumns} data={subjects} onAction={actionRender} />

        {/* Paginación */}
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.total_pages}
          onPageChange={changePage}
          perPage={perPage}
          onPerPageChange={handlePerPageChange}
        />

        {/* Modal para crear/editar materia */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditSubject(null);
          }}
          title={editSubject ? 'Edit Subject' : 'Create Subject'}
        >
          <Form
            fields={formFields}
            onSubmit={onSubjectSubmit}
            initialData={
              editSubject
                ? {
                    name: editSubject.subject_name,
                  }
                : {
                    name: '',
                  }
            }
            onCancel={() => {
              setShowModal(false);
              setEditSubject(null);
            }}
            submitText={editSubject ? 'Actualizar' : 'Crear'}
            layout="grid-cols-1"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Subjects;
```

### Explicación del Código

1. **Estado y Paginación**:
   - `subjects`: Almacena la lista de materias obtenidas del backend.
   - `pagination`: Maneja los datos de paginación (`total_items`, `total_pages`, `current_page`).
   - `perPage`: Controla cuántos registros se muestran por página.
   - `showModal` y `editSubject`: Gestionan el modal para crear/editar materias.

2. **Función `fetchSubjects`**:
   - Realiza una solicitud al endpoint `/subjects` con filtros y parámetros de paginación.
   - Actualiza el estado `subjects` y `pagination` con los datos recibidos.

3. **Formulario de Filtros**:
   - Usa el componente `Form` para crear un formulario de filtros con campos para el nombre y el estado.
   - `onFilterSubmit` envía los filtros a `fetchSubjects`.

4. **Formulario de Creación/Edición**:
   - Usa `Form` dentro de un `Modal` para crear o editar materias.
   - `onSubjectSubmit` envía los datos al backend según si se está creando o editando.

5. **Acciones de Activar/Desactivar**:
   - `deactivateSubject` y `activateSubject` manejan las acciones de desactivar y activar materias con confirmaciones.

6. **Tabla y Paginación**:
   - `Table` muestra las materias con columnas para ID, nombre y estado.
   - `Pagination` permite navegar entre páginas y ajustar `perPage`.

### Configuración del Backend

Asegúrate de que tu backend tenga los siguientes endpoints:

- **POST `/subjects`**: Lista las materias con filtros y paginación. Respuesta esperada:
  ```json
  {
    "subjects": [
      { "pk_subject": 1, "subject_name": "Matemáticas", "status": "ACTIVE" },
      ...
    ],
    "pagination": {
      "total_items": 25,
      "total_pages": 3,
      "current_page": 1
    }
  }
  ```
- **POST `/subjects/create`**: Crea una nueva materia.
- **PUT `/subjects/edit`**: Edita una materia existente.
- **DELETE `/subjects/deactivate`**: Desactiva una materia.
- **PUT `/subjects/activate`**: Activa una materia.

### Integración con Rutas

Añade el módulo a tus rutas en `App.jsx` (o donde configures tus rutas):

```jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Subjects from './Pages/Subjects';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/subjects" element={<Subjects />} />
        {/* Otras rutas */}
      </Routes>
    </Router>
  );
}

export default App;
```

## Consejos para Desarrolladores

1. **Personalizar Estilos**:
   - Si no usas Tailwind CSS, ajusta las clases en los componentes (`bg-Paleta-Celeste`, `text-gray-700`, etc.) a tus propios estilos.
   - Por ejemplo, `bg-Paleta-Celeste` podría ser `#4b7af0` y `bg-Paleta-VerdeSuave` `#6ab04c`.

2. **Extender Campos**:
   - Añade más campos al formulario de filtros o creación/editar modificando `filterFields` y `formFields`. Por ejemplo, para añadir un campo de "créditos" a las materias:
     ```jsx
     const formFields = [
       { name: 'name', label: 'Nombre de la Materia', validation: { required: 'Requerido' } },
       { name: 'credits', label: 'Créditos', type: 'number', validation: { required: 'Requerido' } },
     ];
     ```

3. **Ajustar Paginación**:
   - Cambia las opciones de `perPage` en `Pagination.jsx` si necesitas más o menos registros por página:
     ```jsx
     <option value={100}>100</option>
     ```

4. **Manejo de Errores**:
   - Asegúrate de que tu backend devuelva mensajes de error claros y que el frontend los maneje adecuadamente en las funciones como `fetchSubjects`.

5. **Pruebas**:
   - Prueba cada funcionalidad (listar, filtrar, crear, editar, activar/desactivar) con diferentes casos (pocos registros, muchos registros, errores de red, etc.).

## Solución de Problemas Comunes

1. **La paginación no se muestra**:
   - Verifica que el backend devuelva correctamente `pagination.total_pages`. Si `total_pages` es 0 o 1, la paginación mostrará solo una página, pero el selector de `perPage` seguirá visible.

2. **Los filtros no funcionan**:
   - Asegúrate de que los nombres de los campos en `filters` (por ejemplo, `subject_name`) coincidan con lo que espera el backend.

3. **El modal no se cierra**:
   - Confirma que `onClose` y `onCancel` en el modal y el formulario llamen a `setShowModal(false)` y limpien el estado de edición (`setEditSubject(null)`).

## Conclusión

Con este tutorial, puedes reutilizar los componentes para crear módulos similares a `Users.jsx` o `Subjects.jsx`. La estructura es modular y flexible, permitiendo adaptarla a diferentes tipos de datos (materias, cursos, estudiantes, etc.). Si necesitas más ayuda, revisa los comentarios en el código o experimenta con pequeñas modificaciones para adaptarlo a tus necesidades.

¡Feliz codificación! 🚀