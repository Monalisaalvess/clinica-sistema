import { useEffect, useState } from 'react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import fmt from '../../utils/formatarData';
import '../../styles/painel-layout.css';

export default function Painel() {
  const { user } = useAuth();
  const [consultas, setConsultas] = useState([]);
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [f, setF] = useState({ medicoId: '', dataHoraInicio: '', pacienteId: '' });
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const recepcao = ['recepcionista', 'admin'].includes(user.role); // equipe da clínica agenda em nome do paciente
  const podeAgendar = user.role === 'paciente' || recepcao;

  const carregar = () => api('/consultas').then(setConsultas).catch((e) => setMsg({ tipo: 'erro', texto: e.message }));
  useEffect(() => {
    carregar();
    api('/medicos').then(setMedicos).catch(() => setMsg({ tipo: 'erro', texto: 'Não foi possível carregar os médicos.' }));
    if (recepcao) api('/admin/pacientes').then(setPacientes).catch(() => {});
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

  const concluir = async (id) => {
    try { await api(`/consultas/${id}/concluir`, { method: 'PATCH', body: {} }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  const cancelar = async (id) => {
    if (!confirm('Cancelar esta consulta?')) return;
    try { await api(`/consultas/${id}/cancelar`, { method: 'PATCH', body: {} }); carregar(); }
    catch (err) { setMsg({ tipo: 'erro', texto: err.message }); }
  };

  return (
    <main className="painel">
      <section>
        <h2>{user.role === 'paciente' || user.role === 'medico' ? 'Suas consultas' : 'Consultas'}</h2>
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
                ? <span className="acoes">
                    {user.role === 'medico' && new Date(c.dataHoraInicio) <= new Date() && <button className="link" onClick={() => concluir(c._id)}>Concluir</button>}
                    <button className="link" onClick={() => cancelar(c._id)}>Cancelar</button>
                  </span>
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
              <label>Paciente
                <select value={f.pacienteId} onChange={(e) => setF({ ...f, pacienteId: e.target.value })} required>
                  <option value="">Selecione</option>
                  {pacientes.map((p) => <option key={p._id} value={p._id}>{p.nome}</option>)}
                </select>
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
