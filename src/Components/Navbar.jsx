import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { logout } from '../Utils/auth';

export class Navbar extends Component {
  handleLogout = () => {
    logout()
  }

  render() {
    return (
      <nav className="bg-Paleta-VerdeSuave shadow-md py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo o Título */}
            <div className="flex-shrink-0 text-white text-2xl font-bold">
              <Link to="/dashboard">Mi App</Link>
            </div>

            {/* Menú de navegación */}
            <div className="hidden md:flex space-x-4">
              <Link to="/dashboard" className="text-white hover:bg-Paleta-Celeste hover:text-white px-3 py-2 rounded-md text-lg">Inicio</Link>
              <Link to="/dashboard" className="text-white hover:bg-Paleta-Celeste hover:text-white px-3 py-2 rounded-md text-lg">Perfil</Link>
              <Link to="/dashboard" className="text-white hover:bg-Paleta-Celeste hover:text-white px-3 py-2 rounded-md text-lg">Contacto</Link>
            </div>

            {/* Botón de cerrar sesión */}
            <div className="ml-4 flex items-center space-x-4">
              <button
                onClick={this.handleLogout}
                className="text-white bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-lg font-semibold transition duration-300 ease-in-out"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }
}

export default Navbar
