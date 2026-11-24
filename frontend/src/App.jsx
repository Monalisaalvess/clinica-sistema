import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import RotaProtegida from './components/Rotas/RotaProtegida';
import RotaPublica from './components/Rotas/RotaPublica';
import Home from './pages/Home/Home';
import Auth from './pages/Auth/Auth';
import Painel from './pages/Painel/Painel';
import Admin from './pages/Admin/Admin';
import Geral from './pages/Admin/Geral';
import Medicos from './pages/Admin/Medicos';
import Servicos from './pages/Admin/Servicos';

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<RotaPublica><Home /></RotaPublica>} />
        <Route path="/entrar" element={<RotaPublica><Auth /></RotaPublica>} />

        <Route path="/painel" element={
          <RotaProtegida apenas={['paciente', 'medico', 'recepcionista']}><Painel /></RotaProtegida>
        } />

        <Route path="/admin" element={<RotaProtegida apenas={['admin']}><Admin /></RotaProtegida>}>
          <Route index element={<Geral />} />
          <Route path="medicos" element={<Medicos />} />
          <Route path="servicos" element={<Servicos />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
