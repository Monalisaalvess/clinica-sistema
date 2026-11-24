import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const rotaInicial = (u) => (u.role === 'admin' ? '/admin' : '/painel');

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [carregando, setCarregando] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me')
      .then(setUser)
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setCarregando(false));
  }, []);

  const entrar = ({ token, usuario }) => { localStorage.setItem('token', token); setUser(usuario); };
  const sair = () => { localStorage.removeItem('token'); setUser(null); };

  return (
    <AuthContext.Provider value={{ user, carregando, entrar, sair, destino: user ? rotaInicial(user) : '/' }}>
      {children}
    </AuthContext.Provider>
  );
}
