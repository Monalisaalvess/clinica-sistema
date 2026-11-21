const autorizar = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!rolesPermitidos.includes(req.usuarioRole)) {
            return res.status(403).json({
                success: false,
                message: 'Acesso negado para este perfil'
            });
        }
        next();
    };
};

module.exports = autorizar;