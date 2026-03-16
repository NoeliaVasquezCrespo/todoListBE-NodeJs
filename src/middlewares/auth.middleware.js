const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(403).json({
                message: "No se proporcionó un token"
            });
        }

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify( token, process.env.JWT_SECRET);

        req.user = {
            id: payload.id,
            name: payload.name,
            email: payload.email
        };

        next();

    } catch (error) {

        return res.status(401).json({
            message: "Sin acceso, token incorrecto"
        });
    }
};

module.exports = {
    verifyToken
};
