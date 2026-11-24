import { useEffect, useState } from 'react';
import { api } from '../../api';
import './Resumo.css';

export default function Resumo() {
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
