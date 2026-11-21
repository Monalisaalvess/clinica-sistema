import { useEffect, useState } from 'react';
import { api } from './api';

const SERVICOS = [
  ['Dermatologia', 'Saúde e estética da pele, com protocolos desenhados para o seu tipo de pele.'],
  ['Cardiologia', 'Prevenção e acompanhamento do coração, com exames no mesmo dia.'],
  ['Nutrição', 'Planos alimentares individuais, ajustados à sua rotina e aos seus objetivos.'],
  ['Ortopedia', 'Tratamento de articulações e coluna, do diagnóstico à reabilitação.'],
  ['Psicologia', 'Atendimento reservado e contínuo, no ritmo que fizer sentido para você.'],
  ['Check-up executivo', 'Uma bateria completa de exames e uma conversa de devolução, em uma manhã.'],
];

const fmt = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });

export default function App() {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem('token')) return;
    api('/auth/me').then((u) => { setUser(u); setView('painel'); }).catch(() => localStorage.removeItem('token'));
  }, []);

  const entrar = ({ token, usuario }) => { localStorage.setItem('token', token); setUser(usuario); setView('painel'); };
  const sair = () => { localStorage.removeItem('token'); setUser(null); setView('home'); };

  return (
    <>
      <header className={'topo' + (view === 'home' ? ' topo-escuro' : '')}>
        <button className="marca" onClick={() => setView(user ? 'painel' : 'home')}>Áurea</button>
        <nav>
          {user ? (
            <>
              <span className="saudacao">{user.nome.split(' ')[0]}</span>
              <button className="link" onClick={sair}>Sair</button>
            </>
          ) : (
            <button className="link" onClick={() => setView('auth')}>Entrar</button>
          )}
        </nav>
      </header>

      {view === 'home' && <Home onAgendar={() => setView(user ? 'painel' : 'auth')} />}
      {view === 'auth' && <Auth onSucesso={entrar} />}
      {view === 'painel' && user && <Painel user={user} />}
    </>
  );
}

function Home({ onAgendar }) {
  return (
    <main>
      <section className="hero">
        <h1>Medicina feita com tempo, silêncio e atenção.</h1>
        <p>Consultas sem pressa, com especialistas que conhecem a sua história.</p>
        <button className="btn btn-ouro" onClick={onAgendar}>Agendar consulta</button>
      </section>
      <section className="servicos">
        <h2>Especialidades</h2>
        <ul>
          {SERVICOS.map(([nome, desc]) => (
            <li key={nome}><h3>{nome}</h3><p>{desc}</p></li>
          ))}
        </ul>
      </section>
      <footer className="rodape">Áurea Clínica</footer>
    </main>
  );
}

function Auth({ onSucesso }) {
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
      onSucesso(data);
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

function Painel({ user }) {
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [f, setF] = useState({ medicoId: '', dataHoraInicio: '', pacienteId: '' });
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const recepcao = user.role === 'recepcionista';
  const podeAgendar = user.role === 'paciente' || recepcao;

  const carregar = () => api('/consultas').then(setConsultas).catch((e) => setMsg({ tipo: 'erro', texto: e.message }));
  useEffect(() => {
    carregar();
    api('/medicos').then(setMedicos).catch(() => setMsg({ tipo: 'erro', texto: 'Não foi possível carregar os médicos.' }));
  }, []);

  const agendar = async (e) => {
    e.preventDefault();
    setMsg({ tipo: '', texto: '' });
    try {
      const body = { medicoId: f.medicoId, dataHoraInicio: new Date(f.dataHoraInicio).toISOString() };
      if (recepcao) body.pacienteId = f.pacienteId;
      await api('/consultas', { method: 'POST', body });
      setMsg({ tipo: 'ok', texto: 'Consulta agendada.' });
      setF({ medicoId: '', dataHoraInicio: '', pacienteId: '' });
      carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  const cancelar = async (id) => {
    if (!confirm('Cancelar esta consulta?')) return;
    try { await api(`/consultas/${id}/cancelar`, { method: 'PATCH', body: {} }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  return (
    <main className="painel">
      <section>
        <h2>Suas consultas</h2>
        {consultas.length === 0 && <p className="vazio">Nenhuma consulta por aqui. Agende a primeira ao lado.</p>}
        <ul className="consultas">
          {consultas.map((c) => (
            <li key={c._id} className={c.status !== 'agendada' ? 'inativa' : ''}>
              <div>
                <strong>{fmt(c.dataHoraInicio)}</strong>
                <span>
                  {user.role === 'medico' ? c.paciente?.nome : `Dr(a). ${c.medico?.nome}`}
                  {c.medico?.especialidade && user.role !== 'medico' ? `, ${c.medico.especialidade}` : ''}
                </span>
              </div>
              {c.status === 'agendada'
                ? <button className="link" onClick={() => cancelar(c._id)}>Cancelar</button>
                : <em>{c.status}</em>}
            </li>
          ))}
        </ul>
      </section>

      {podeAgendar && (
        <section className="lateral">
          <form onSubmit={agendar}>
            <h2>Agendar consulta</h2>
            {recepcao && (
              <label>ID do paciente
                <input value={f.pacienteId} onChange={(e) => setF({ ...f, pacienteId: e.target.value })} required />
              </label>
            )}
            <label>Médico
              <select value={f.medicoId} onChange={(e) => setF({ ...f, medicoId: e.target.value })} required>
                <option value="">Selecione</option>
                {medicos.map((m) => <option key={m.id} value={m.id}>{m.nome}, {m.especialidade}</option>)}
              </select>
            </label>
            <label>Data e horário
              <input type="datetime-local" value={f.dataHoraInicio} onChange={(e) => setF({ ...f, dataHoraInicio: e.target.value })} required />
            </label>
            {msg.texto && <p className={msg.tipo === 'ok' ? 'ok' : 'erro'}>{msg.texto}</p>}
            <button className="btn btn-ouro">Confirmar agendamento</button>
          </form>
        </section>
      )}
    </main>
  );
}
