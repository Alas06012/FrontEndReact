//import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './Auth/Login';
import ProtectedRoute from './Auth/ProtectedRoute';

import StudentsHome from './Dashboards/StudentsHome';
import Register from './Auth/Register'
import PageNotFound from './Others/PageNotFound'
import Navbar from './Components/Navbar';


export default function App() {
  //const [count, setCount] = useState(0)

  return (
    <section className='router-container'>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navbar />
                <StudentsHome />
              </ProtectedRoute>
            }
          />

          {/** PAGINA 404 **/}
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </BrowserRouter>
    </section>
  )
}


