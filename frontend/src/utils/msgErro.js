const msgErro = (e) => (e.erros && Object.values(e.erros).join('. ')) || e.message;
export default msgErro;
