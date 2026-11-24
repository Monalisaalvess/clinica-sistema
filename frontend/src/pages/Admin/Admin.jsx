import { NavLink, Outlet } from 'react-router-dom';
import './Admin.css';

const ABAS = [['/admin', 'Visão geral', true], ['/admin/medicos', 'Médicos'], ['/admin/servicos', 'Serviços']];

export default function Admin() {
  return (
    <>
      <nav className="abas">
        {ABAS.map(([to, texto, end]) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => (isActive ? 'ativa' : '')}>{texto}</NavLink>
        ))}
      </nav>
      <Outlet />
    </>
  );
}
