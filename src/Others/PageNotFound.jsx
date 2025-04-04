
import { Link } from 'react-router-dom';

export default function NotFound () {
    return (
        <div className='text-white' style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>404 - Página No Encontrada</h1>
            <p>La pagina que estas buscando no existe.</p>
            
            <Link className='text-white' style={{ textDecoration: 'none' }} to="/">
                <button>Volver a Inicio</button>
            </Link>
            
            
        </div>
    );
}
