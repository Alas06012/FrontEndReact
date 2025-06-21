import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './Auth/Login';
import Register from './Auth/Register';
import PageNotFound from './Others/PageNotFound';
import StudentDashboard from './Dashboards/StudentDashboard';
import Dashboard from './Dashboards/Dashboard';
import AdminDashboard from './Dashboards/AdminHome';
import UsersAdmin from './Dashboards/Admin/UsersAdmin';
import Prompts from '../src/Dashboards/Admin/Prompts/Prompts';
//import StudyMaterials from './Dashboards/Students/StudyMaterials';
import StudyMaterials from '../src/Dashboards/Admin/study_materials/StudyMaterials';
import TestComments from '../src/Dashboards/Admin/test_comments/TestComments';
import NewTest from './Dashboards/Students/Test/NewTest';
import StudyHome from './Dashboards/Students/StudyMaterial/StudyHome';
import QuestionBank from './Dashboards/Admin/QuestionBank';

import ProtectedRoute from './Auth/ProtectedRoute';
import Layout from './Components/Layout';

import TitlesAdmin from './Dashboards/Admin/questions_titles/TitlesAdmin';
import QuestionsAdmin from './Dashboards/Admin/Questions/QuestionAdmin';
import VerifyCode from './Auth/VerifyCode';
import ForgotPassword from './Auth/ForgotPassword';
import ResetPassword from './Auth/ResetPassword';

export default function App() {
  return (
    <section className='router-container'>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

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
              <Route index element={<Dashboard />} />
              <Route path="users" element={<UsersAdmin />} />
              <Route path="prompts" element={<Prompts />} />
              <Route path="study_materials" element={<StudyMaterials />} />
              <Route path="test_comments" element={<TestComments />} />
              <Route path="questionsbank" element={<QuestionBank />} />
              <Route path="TitlesAdmin" element={<TitlesAdmin />} />
              <Route path="QuestionsAdmin" element={<QuestionsAdmin />} />
           
            </Route>

            {/* Rutas para teacher */}
            <Route path="teacher" >
              <Route index element={<Dashboard />} />
              <Route path="materials" element={<StudyMaterials />} />
            </Route>

            {/* Rutas para student */}
            <Route path="student" >
              <Route index element={<Dashboard />} />
              <Route path="materials" element={<StudyMaterials />} />
              <Route path="newtest" element={<NewTest />} />
              <Route path="studyhome" element={<StudyHome />} />
            </Route>

            {/* Página 404 */}
            <Route path="*" element={<PageNotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </section>
  );
}