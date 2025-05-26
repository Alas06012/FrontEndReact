import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Alert from '../../../Components/Alert.jsx';
import { API_URL } from '../../../../config.js';
import { getUserRole } from '../../../Utils/auth.js';
import { Plus } from 'lucide-react';
import Table from '../../../Components/Table.jsx';
import Modal from '../../../Components/Modal.jsx';
import Pagination from '../../../Components/Pagination.jsx';
import TestFormModal from '../../../Components/TestFormModal.jsx';

const Tests = () => {
  const [tests, setTests] = useState([]);
  const [pagination, setPagination] = useState({ total_items: 0, total_pages: 1, current_page: 1 });
  const [perPage, setPerPage] = useState(20);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    user_email: '',
    user_name: '',
    user_lastname: '',
    level_name: '',
  });

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsData, setDetailsData] = useState(null);

  const navigate = useNavigate();
  const userRole = getUserRole()?.toLowerCase();

  useEffect(() => {
    if (!userRole || (userRole !== 'admin' && userRole !== 'teacher')) {
      Alert({
        title: 'Access Denied',
        text: 'You need admin or teacher privileges to access this page.',
        icon: 'error',
        background: '#4b7af0',
        color: 'white',
      });
      navigate('/dashboard/student');
    } else {
      fetchTests();
    }
  }, [userRole, navigate]);

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fetchTests = async (page = 1, per_page = perPage) => {
    setLoading(true);
    try {
      const body = {
        page,
        per_page,
        ...filters,
      };

      const response = await fetch(`${API_URL}/all-tests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.tests);
        setPagination(data.pagination);
      } else {
        const err = await response.json();
        Alert({ title: 'Error', text: err.error || 'Failed to fetch tests', icon: 'error', background: '#4b7af0', color: 'white' });
      }
    } catch {
      Alert({ title: 'Error', text: 'Network error', icon: 'error', background: '#4b7af0', color: 'white' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => fetchTests(1, perPage);

  const createTest = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/newtest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert({
          title: 'Error',
          text: err.message || 'Failed to create test',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
        return;
      }

      const res = await response.json();
      Alert({
        title: 'Success',
        text: res.message || 'Test created successfully',
        icon: 'success',
        background: '#1e293b',
        color: 'white',
      });

      fetchTests();

      if (res?.data?.detalles?.length > 0 && res.data.test_id) {
        fetchTestData(res.data.test_id);
      }

    } catch (err) {
      Alert({
        title: 'Error',
        text: 'Network error',
        icon: 'error',
        background: '#1e293b',
        color: 'white',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestData = async (testId) => {
    try {
      const response = await fetch(`${API_URL}/test-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({ test_id: testId })
      });

      if (!response.ok) {
        const err = await response.json();
        Alert({
          title: 'Error',
          text: err.message || 'Error loading test details',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
        return;
      }

      const data = await response.json();
      if (data?.sections?.length > 0) {
        setDetailsData(data);
        setShowDetailsModal(true);
      }
    } catch (error) {
      Alert({
        title: 'Error',
        text: 'Failed to fetch test data',
        icon: 'error',
        background: '#1e293b',
        color: 'white',
      });
    }
  };

  const handleTestSubmit = async (responses) => {
    try {
      const payload = {
        test_id: detailsData.test_id,
        detalles: responses.detalles,
      };
      console.log("asdsafasfsaf",payload);
      const response = await fetch(`${API_URL}/finish-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json();
        Alert({
          title: 'Error',
          text: err.message || 'Failed to submit test',
          icon: 'error',
          background: '#1e293b',
          color: 'white',
        });
        return;
      }

      const result = await response.json();
      Alert({
        title: 'Success',
        text: result.message || 'Test submitted successfully!',
        icon: 'success',
        background: '#1e293b',
        color: 'white',
      });

      fetchTests();
      setShowDetailsModal(false);  // Cierra modal después de enviar

    } catch (error) {
      Alert({
        title: 'Error',
        text: 'Submission failed',
        icon: 'error',
        background: '#1e293b',
        color: 'white',
      });
    }
  };

  const changePage = (page) => fetchTests(page, perPage);

  const handlePerPageChange = (e) => {
    const newPerPage = parseInt(e.target.value, 10);
    setPerPage(newPerPage);
    fetchTests(1, newPerPage);
  };

  const tableColumns = [
    { header: 'ID Test', key: 'pk_test' },
    { header: 'Email', key: 'user_email' },
    { header: 'Name', key: 'user_name' },
    { header: 'Lastname', key: 'user_lastname' },
    { header: 'Level', key: 'level_name' },
    { header: 'Status', key: 'status' },
    { header: 'Passed', key: 'test_passed' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800 tracking-tight">
          Test Management
        </h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <input
            type="text"
            name="user_email"
            placeholder="Email"
            value={filters.user_email}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="user_name"
            placeholder="First Name"
            value={filters.user_name}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="user_lastname"
            placeholder="Last Name"
            value={filters.user_lastname}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <select
            name="level_name"
            value={filters.level_name}
            onChange={handleFilterChange}
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="">All Levels</option>
            {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-10">
          <button
            onClick={applyFilters}
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-xl shadow transition"
          >
            Apply Filters
          </button>

          <button
            onClick={createTest}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-xl shadow transition"
          >
            <Plus className="w-5 h-5" />
            Create Test
          </button>
        </div>

        {/* Table */}
        <Table
          columns={tableColumns}
          data={tests}
          loading={loading}
          actionTitle=""
          className="rounded-md shadow-md overflow-hidden"
        />

        {/* Pagination */}
        <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            onPageChange={changePage}
          />
          <select
            className="rounded-xl border border-gray-300 px-4 py-2 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={perPage}
            onChange={handlePerPageChange}
          >
            {[10, 20, 50].map(n => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>

        {/* Modal */}
        <TestFormModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          testData={detailsData}
          onSubmit={handleTestSubmit}
        />
      </div>
    </div>
  );
};

export default Tests;
