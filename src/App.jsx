import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Auth/Login';
import Register from './Auth/Register';
import PageNotFound from './Others/PageNotFound';
import StudentDashboard from './Dashboards/StudentsHome';
import AdminDashboard from './Dashboards/AdminHome';
import UsersAdmin from './Dashboards/Admin/UsersAdmin';
import Prompts from '../src/Dashboards/Admin/Prompts/Prompts';
import StudyMaterials from './Dashboards/Students/StudyMaterials';
import NewTest from './Dashboards/Students/NewTest';
import QuestionBank from './Dashboards/Admin/QuestionBank';

import ProtectedRoute from './Auth/ProtectedRoute';
import Layout from './Components/Layout';

import TitlesAdmin from './Dashboards/Admin/questions_titles/TitlesAdmin';
<<<<<<< HEAD
import QuestionsAdmin from './Dashboards/Admin/Questions/QuestionAdmin';
=======
>>>>>>> ed49b39157a639cb6a102d83567d39b795767b0d

export default function App() {
  return (
    <section className='router-container'>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas protegidas */}

          <Route path="/dashboard" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            {/* Redirección automática según el rol */}
            <Route
              index
              element={
                <ProtectedRoute>
                  {() => {
                    const role = getUserRole()?.toLowerCase();
                    return <Navigate to={`/dashboard/${role}`} replace />;
                  }}
                </ProtectedRoute>
              }
            />

            {/* Rutas para admin */}
            <Route path="admin">
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="prompts" element={<Prompts />} />
              <Route path="questionsbank" element={<QuestionBank />} />
              <Route path="TitlesAdmin" element={<TitlesAdmin />} />
              <Route path="QuestionsAdmin" element={<QuestionsAdmin />} />
            </Route>

            {/* Rutas para student */}
            <Route path="student" >
              <Route index element={<StudentDashboard />} />
              <Route path="materials" element={<StudyMaterials />} />
              <Route path="newtest" element={<NewTest />} />
            </Route>

            {/* Página 404 */}
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </section>
  );
}