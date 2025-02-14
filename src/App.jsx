import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  const [mensaje, setMensaje] = useState("");

  const consultarAPI = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/api/consulta");
      const data = await response.json();
      setMensaje(data.mensaje);
    } catch (error) {
      console.error("Error al consultar la API:", error);
      setMensaje("Error en la consulta");
    }
  };

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>

      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h1 className="text-2xl font-bold mb-4">Prueba de conexión con API</h1>
        <button
          onClick={consultarAPI}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
        >
          Consultar API
        </button>
        {mensaje && <p className="mt-4 text-lg">{mensaje}</p>}
      </div>

      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
}

export default App
