import { useEffect, useState } from 'react';
import { api } from '../api';

export default function useLista(path) {
  const [itens, setItens] = useState([]);
  const carregar = () => api(path).then(setItens).catch(() => {});
  useEffect(() => { carregar(); }, []);
  return [itens, carregar];
}
