import { useState } from 'react';
import { api } from '../../api';
import useLista from '../../hooks/useLista';
import msgErro from '../../utils/msgErro';
import '../../styles/painel-layout.css';

export default function Medicos() {
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
