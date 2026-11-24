import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Página só para quem não está logado (início e entrar)
export default function RotaPublica({ children }) {
  const { user, carregando, destino } = useAuth();
  if (carregando) return null;
  if (user) return <Navigate to={destino} replace />;
  return children;
}
