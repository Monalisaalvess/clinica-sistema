import { useEffect, useState } from 'react';
import { api } from './api';

const msgErro = (e) => (e.erros && Object.values(e.erros).join('. ')) || e.message;

function useLista(path) {
  const [itens, setItens] = useState([]);
  const carregar = () => api(path).then(setItens).catch(() => {});
  useEffect(() => { carregar(); }, []);
  return [itens, carregar];
}

export default function Admin({ lista }) {
  const [aba, setAba] = useState('geral');
  const abas = [['geral', 'Visão geral'], ['medicos', 'Médicos'], ['servicos', 'Serviços']];
  return (
    <>
      <nav className="abas">
        {abas.map(([k, t]) => (
          <button key={k} className={aba === k ? 'ativa' : ''} onClick={() => setAba(k)}>{t}</button>
        ))}
      </nav>
      {aba === 'geral' && <><Resumo />{lista}</>}
      {aba === 'medicos' && <Medicos />}
      {aba === 'servicos' && <Servicos />}
    </>
  );
}

function Resumo() {
  const [r, setR] = useState(null);
  useEffect(() => { api('/admin/resumo').then(setR).catch(() => {}); }, []);
  if (!r) return null;
  const itens = [['Consultas hoje', r.hoje], ['Agendadas', r.agendadas], ['Canceladas', r.canceladas], ['Médicos ativos', r.medicos], ['Pacientes', r.pacientes]];
  return (
    <section className="resumo">
      {itens.map(([t, v]) => <div key={t}><strong>{v}</strong><span>{t}</span></div>)}
    </section>
  );
}

function Medicos() {
  const vazio = { nome: '', email: '', telefone: '', crm: '', especialidade: '', tempoConsultaMinutos: 30, senha: '' };
  const [medicos, carregar] = useLista('/admin/medicos');
  const [f, setF] = useState(vazio);
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/medicos', { method: 'POST', body: { ...f, tempoConsultaMinutos: Number(f.tempoConsultaMinutos), senhaConfirm: f.senha } });
      setMsg({ tipo: 'ok', texto: 'Médico cadastrado.' }); setF(vazio); carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: msgErro(err) }); }
  };
  const alternar = (m) => api(`/admin/medicos/${m._id}`, { method: 'PATCH', body: { ativo: !m.ativo } }).then(carregar);

  const campos = [['nome', 'Nome completo'], ['email', 'E-mail', 'email'], ['telefone', 'Telefone (somente números)', 'tel'], ['crm', 'CRM'], ['especialidade', 'Especialidade'], ['senha', 'Senha provisória', 'password']];
  return (
    <main className="painel">
      <section>
        <h2>Médicos</h2>
        {medicos.length === 0 && <p className="vazio">Nenhum médico cadastrado. Use o formulário ao lado.</p>}
        <ul className="consultas">
          {medicos.map((m) => (
            <li key={m._id} className={m.ativo ? '' : 'inativa'}>
              <div><strong>{m.nome}</strong><span>{m.especialidade}, {m.crm}, consultas de {m.tempoConsultaMinutos} min</span></div>
              <button className="link" onClick={() => alternar(m)}>{m.ativo ? 'Desativar' : 'Reativar'}</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="lateral">
        <form onSubmit={salvar}>
          <h2>Novo médico</h2>
          {campos.map(([k, l, t]) => <label key={k}>{l}<input type={t || 'text'} value={f[k]} onChange={set(k)} required /></label>)}
          <label>Duração da consulta (minutos)<input type="number" min="15" max="120" value={f.tempoConsultaMinutos} onChange={set('tempoConsultaMinutos')} required /></label>
          {msg.texto && <p className={msg.tipo === 'ok' ? 'ok' : 'erro'}>{msg.texto}</p>}
          <button className="btn btn-ouro">Cadastrar médico</button>
        </form>
      </section>
    </main>
  );
}

function Servicos() {
  const [servicos, carregar] = useLista('/admin/servicos');
  const [f, setF] = useState({ nome: '', descricao: '' });
  const [msg, setMsg] = useState({ tipo: '', texto: '' });

  const salvar = async (e) => {
    e.preventDefault();
    try {
      await api('/admin/servicos', { method: 'POST', body: f });
      setMsg({ tipo: 'ok', texto: 'Serviço cadastrado.' }); setF({ nome: '', descricao: '' }); carregar();
    } catch (err) { setMsg({ tipo: 'erro', texto: msgErro(err) }); }
  };
  const alternar = (s) => api(`/admin/servicos/${s._id}`, { method: 'PATCH', body: { ativo: !s.ativo } }).then(carregar);

  return (
    <main className="painel">
      <section>
        <h2>Serviços</h2>
        {servicos.length === 0 && <p className="vazio">Nenhum serviço cadastrado. Os serviços aparecem na página inicial.</p>}
        <ul className="consultas">
          {servicos.map((s) => (
            <li key={s._id} className={s.ativo ? '' : 'inativa'}>
              <div><strong>{s.nome}</strong><span>{s.descricao}</span></div>
              <button className="link" onClick={() => alternar(s)}>{s.ativo ? 'Ocultar' : 'Exibir'}</button>
            </li>
          ))}
        </ul>
      </section>
      <section className="lateral">
        <form onSubmit={salvar}>
          <h2>Novo serviço</h2>
          <label>Nome<input value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} required /></label>
          <label>Descrição<input value={f.descricao} onChange={(e) => setF({ ...f, descricao: e.target.value })} /></label>
          {msg.texto && <p className={msg.tipo === 'ok' ? 'ok' : 'erro'}>{msg.texto}</p>}
          <button className="btn btn-ouro">Cadastrar serviço</button>
        </form>
      </section>
    </main>
  );
}
