import { useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import './Auth.css';

export default function Auth() {
  const { entrar } = useAuth();
  const [cadastro, setCadastro] = useState(false);
  const [f, setF] = useState({});
  const [erro, setErro] = useState('');
  const [erros, setErros] = useState({});
  const [loading, setLoading] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const enviar = async (e) => {
    e.preventDefault();
    setErro(''); setErros({}); setLoading(true);
    try {
      const data = await api(cadastro ? '/auth/signup' : '/auth/login', { method: 'POST', body: f });
      entrar(data);
    } catch (err) {
      setErro(err.message); setErros(err.erros || {});
    } finally { setLoading(false); }
  };

  const campo = (k, label, type = 'text') => (
    <label>{label}
      <input type={type} value={f[k] || ''} onChange={set(k)} required />
      {erros[k] && <small className="erro">{erros[k]}</small>}
    </label>
  );

  return (
    <main className="centro">
      <form className="painel-form" onSubmit={enviar}>
        <h2>{cadastro ? 'Criar conta' : 'Entrar'}</h2>
        {cadastro && campo('nome', 'Nome completo')}
        {campo('email', 'E-mail', 'email')}
        {cadastro && <>
          {campo('telefone', 'Telefone (somente números)', 'tel')}
          {campo('cpf', 'CPF (somente números)')}
        </>}
        {campo('senha', 'Senha', 'password')}
        {cadastro && campo('senhaConfirm', 'Confirmar senha', 'password')}
        {erro && !Object.keys(erros).length && <p className="erro">{erro}</p>}
        <button className="btn btn-escuro" disabled={loading}>{loading ? 'Aguarde…' : cadastro ? 'Criar conta' : 'Entrar'}</button>
        <button type="button" className="link" onClick={() => { setCadastro(!cadastro); setErro(''); setErros({}); }}>
          {cadastro ? 'Já tenho conta' : 'Ainda não tenho conta'}
        </button>
      </form>
    </main>
  );
}
