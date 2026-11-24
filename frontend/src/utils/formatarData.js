const formatarData = (d) => new Date(d).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
export default formatarData;
