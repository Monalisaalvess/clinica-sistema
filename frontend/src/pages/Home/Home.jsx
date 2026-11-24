import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api';
import './Home.css';

const SERVICOS = [
  ['Dermatologia', 'Cuidados especializados com a saúde da pele, incluindo prevenção, avaliação e tratamento de condições dermatológicas.'],
  ['Neuropsicologia', 'Avaliação das funções cognitivas e comportamentais, com acompanhamento individualizado para diferentes necessidades.'],
  ['Nutrição', 'Orientação nutricional personalizada, com foco em hábitos saudáveis, equilíbrio alimentar e qualidade de vida.'],
  ['Fisioterapia Adulto e Idoso', 'Prevenção e tratamento de alterações motoras, dores e limitações funcionais, promovendo mobilidade, autonomia e qualidade de vida.'],
  ['Psicologia', 'Acompanhamento psicológico individualizado, com escuta qualificada e suporte para a saúde emocional e o bem-estar mental.'],
  ['Fisioterapia Infantil', 'Estimulação e desenvolvimento das habilidades motoras infantis, respeitando as necessidades e particularidades de cada fase da infância.'],

];

export default function Home() {
  const navigate = useNavigate();
  const [lista, setLista] = useState(SERVICOS.map(([nome, descricao]) => ({ nome, descricao })));
  useEffect(() => { api('/servicos').then((d) => d.length && setLista(d)).catch(() => {}); }, []);
  return (
    <main>
      <section className="hero">
        <h1>Um cuidado que acompanha todas as suas fases.</h1>
        <p>Diferentes especialidades. Um propósito: cuidar.</p>
        <button className="btn btn-ouro" onClick={() => navigate('/entrar')}>Agendar consulta</button>
      </section>
      <section className="servicos">
        <h2>Conheça nossas especialidades</h2>
        <ul>
          {lista.map((s) => (
            <li key={s._id || s.nome}><h3>{s.nome}</h3><p>{s.descricao}</p></li>
          ))}
        </ul>
      </section>
      <footer className="rodape"> &copy; Revita Clínica</footer>
    </main>
  );
}
