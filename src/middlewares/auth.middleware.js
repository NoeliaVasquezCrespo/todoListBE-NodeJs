const jwt = require('jsonwebtoken');
const db = require('../db/connection');

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

        const [users] = await db.execute(
            `SELECT id, name, email FROM users WHERE id = ?`, [payload.id]
        );

        if (!users.length) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        req.user = users[0];

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
