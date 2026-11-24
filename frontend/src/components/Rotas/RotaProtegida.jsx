import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// "apenas" = perfis permitidos; sem ele, qualquer usuário logado entra
export default function RotaProtegida({ children, apenas }) {
  const { user, carregando, destino } = useAuth();
  if (carregando) return null;
  if (!user) return <Navigate to="/entrar" replace />;
  if (apenas && !apenas.includes(user.role)) return <Navigate to={destino} replace />;
  return children;
}
