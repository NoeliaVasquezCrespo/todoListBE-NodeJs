const bcrypt = require('bcrypt');
const db = require('../db/connection');

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (id, name, email, password) VALUES (UUID(), ?, ?, ?)`;

        await db.execute(query, [name, email, hashedPassword]);

        res.status(201).json({
            name, email, hashedPassword
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    registerUser
};
