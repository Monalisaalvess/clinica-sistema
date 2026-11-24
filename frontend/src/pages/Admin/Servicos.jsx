import { useState } from 'react';
import { api } from '../../api';
import useLista from '../../hooks/useLista';
import msgErro from '../../utils/msgErro';
import '../../styles/painel-layout.css';

export default function Servicos() {
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
