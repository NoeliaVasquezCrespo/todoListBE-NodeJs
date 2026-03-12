const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/connection');
const { userDecorator } = require('../decorators/user.decorator');

const store = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())`;

        await db.execute(query, [name, email, hashedPassword]);

        res.status(201).json(
            userDecorator({ name, email })
        );

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const login = async (req, res) => {
    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "email y password son obligatorios"
            });
        }

        const [users] = await db.execute(
            `SELECT * FROM users WHERE email = ?`, [email]
        );

        const user = users[0];

        if (!user) {
            return res.status(401).json({ message: "Datos incorrectos" });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Datos incorrectos" });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" }
        );

        res.json({
            accessToken: token,
            user: userDecorator(user)
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

module.exports = {
    store,
    login
};
