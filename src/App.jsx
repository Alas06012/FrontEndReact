// App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './Auth/Login';
import Register from './Auth/Register';
import PageNotFound from './Others/PageNotFound';
import StudentDashboard from './Dashboards/StudentsHome';
import AdminDashboard from './Dashboards/AdminHome';
import UsersAdmin from './Dashboards/Admin/UsersAdmin';

import ProtectedRoute from './Auth/ProtectedRoute';
import Layout from './Components/Layout';


export default function App() {
  return (
    <section className='router-container'>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Layout general para rutas protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>

            {/* Rutas para admin */}
            <Route path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }>
              <Route path="users" element={<UsersAdmin />} />
              {/* <Route path="reports" element={<AdminUsers />} />  */}
            </Route>




            {/* Rutas para student */}
            <Route path="student"
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }>
              {/* <Route path="courses" element={<StudentCourses />} />
              <Route path="grades" element={<StudentGrades />} /> */}
            </Route>
          </Route>


          {/* Página 404 */}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </section>
  );
}
