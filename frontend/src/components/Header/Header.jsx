import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

export default function Header() {
  const { user, sair, destino } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  return (
    <header className={'topo' + (pathname === '/' ? ' topo-escuro' : '')}>
      <Link className="marca" to={user ? destino : '/'}>Revita</Link>
      <nav>
        {user ? (
          <>
            <span className="saudacao">{user.nome.split(' ')[0]}</span>
            <button className="link" onClick={() => { sair(); navigate('/'); }}>Sair</button>
          </>
        ) : (
          <Link className="link btn-logout" to="/entrar">Entrar</Link>
        )}
      </nav>
    </header>
  );
}
