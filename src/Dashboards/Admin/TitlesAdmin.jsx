import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '/config.js';
import Alert from '../../Components/Alert';
import { getAccessToken } from '../../Utils/auth';
import TitleForm from './TitleForm';
import TitleTable from './TitleTable';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-xl p-6">
        <button
          className="absolute top-2 right-2 text-2xl text-gray-500 hover:text-black"
          onClick={onClose}
          aria-label="Cerrar modal"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

const ConfirmModal = ({ isOpen, onClose, onConfirm, title }) => {
  if (!isOpen || !title) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">
        ¿Estás seguro de que deseas {title.status === 'ACTIVE' ? 'desactivar' : 'activar'} este título?
      </h2>
      <p className="mb-6 text-gray-600">"{title.title_name}"</p>
      <div className="flex justify-end gap-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-800"
        >
          Cancelar
        </button>
        <button
          onClick={() => onConfirm(title)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
        >
          Confirmar
        </button>
      </div>
    </Modal>
  );
};

const TitlesAdmin = () => {
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typingTimeout, setTypingTimeout] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [titleToToggle, setTitleToToggle] = useState(null);

  const token = getAccessToken();
  const navigate = useNavigate();

  const showAlert = (text, icon = 'success') => {
    Alert({
      title: icon === 'error' ? 'Error' : 'Éxito',
      text,
      icon,
      background: '#4b7af0',
      color: 'white',
    });
  };

  const fetchTitles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/stories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          page,
          per_page: 10,
          search,
        }),
      });

      if (!response.ok) throw new Error('Error al cargar los títulos');

      const data = await response.json();
      setTitles(data.titles || []);
      setTotalPages(data.pagination?.total_pages || 1);
      setError(null);
    } catch (err) {
      setError(err.message);
      showAlert(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      fetchTitles();
    }, 500);
    setTypingTimeout(timeout);
  }, [search, page]);

  const handleEdit = (title) => {
    setSelectedTitle(title);
    setShowForm(true);
  };

  const handleCancel = () => {
    setSelectedTitle(null);
    setShowForm(false);
  };

  const handleSubmit = async (formData) => {
    try {
      const method = selectedTitle ? 'PUT' : 'POST';
      const endpoint = `${API_URL}/story`;

      const payload = selectedTitle
        ? { id: selectedTitle.pk_title, ...formData }
        : formData;

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error('Error al guardar el título');

      await fetchTitles();
      showAlert(selectedTitle ? 'Título actualizado correctamente' : 'Título creado correctamente');
      handleCancel();
    } catch (err) {
      showAlert(err.message, 'error');
    }
  };

  const requestToggleStatus = (title) => {
    setTitleToToggle(title);
    setShowConfirm(true);
  };

  const handleToggleStatus = async (title) => {
    try {
      const newStatus = title.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      const response = await fetch(`${API_URL}/story`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: title.pk_title,
          status: newStatus,
        }),
      });

      if (!response.ok) throw new Error('Error al cambiar el estado del título');

      await fetchTitles();
      showAlert(`Título ${newStatus === 'ACTIVE' ? 'activado' : 'desactivado'} correctamente`);
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setShowConfirm(false);
      setTitleToToggle(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6 text-center text-gray-800">
        Gestión de Títulos
      </h1>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-1/2">
          <input
            type="text"
            placeholder="Buscar por título..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-md pl-10 focus:ring-2 focus:ring-blue-500"
          />
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
        </div>

        <button
          onClick={() => {
            setSelectedTitle(null);
            setShowForm(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 ease-in-out flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Título
        </button>
      </div>

      {loading ? (
        <div className="text-center text-lg text-gray-600">Cargando...</div>
      ) : error ? (
        <div className="text-center text-red-500 text-lg">{error}</div>
      ) : titles.length === 0 ? (
        <div className="text-center text-gray-500 text-lg">No se encontraron títulos.</div>
      ) : (
        <>
          <TitleTable
            titles={titles}
            onEdit={handleEdit}
            onToggleStatus={requestToggleStatus}
          />

          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-300"
            >
              Anterior
            </button>

            <span className="text-gray-700 font-semibold">
              Página {page} de {totalPages}
            </span>

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-all duration-300"
            >
              Siguiente
            </button>
          </div>
        </>
      )}

      <Modal isOpen={showForm} onClose={handleCancel}>
        <TitleForm
          onSubmit={handleSubmit}
          initialData={selectedTitle}
          onCancel={handleCancel}
        />
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleToggleStatus}
        title={titleToToggle}
      />
    </div>
  );
};

export default TitlesAdmin;
