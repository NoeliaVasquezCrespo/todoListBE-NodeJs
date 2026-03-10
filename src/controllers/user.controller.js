const bcrypt = require('bcrypt');
const db = require('../db/connection');

const store = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `INSERT INTO users (id, name, email, password, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())`;

        await db.execute(query, [name, email, hashedPassword]);

        res.status(201).json({
            name, email, hashedPassword
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

module.exports = {
    store
};
