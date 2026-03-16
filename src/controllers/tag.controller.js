const db = require('../db/connection');
const { tagDecorator } = require('../decorators/tag.decorator');

const index = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [tags] = await db.execute(
            `SELECT * FROM tags WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?`, [userId, limit, offset]
        );

        res.json({
            page,
            limit,
            data: tags.map(tagDecorator)
        });

    } catch (error) {
        res.status(500).json(error);
    }
}

const show = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [tag] = await db.execute(
            `SELECT * FROM tags WHERE id = ? AND user_id = ?`, [id, userId]
        );

        if (!tag.length) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        res.json(tagDecorator(tag[0]));

    } catch (error) {
        res.status(500).json(error);
    }
}

const store = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, description, color } = req.body;

        if (!name || !description || !color) {
            return res.status(400).json({
                message: "name, description y color son obligatorios"
            });
        }

        const [exists] = await db.execute(
            `SELECT id FROM tags WHERE name = ? AND user_id = ?`, [name, userId]
        );

        if (exists.length) {
            return res.status(400).json({ message: "El nombre de la etiqueta ya existe" });
        }

        await db.execute(
            `INSERT INTO tags (id, name, description, color, user_id, created_at, updated_at) VALUES (UUID(), ?, ?, ?, ?, NOW(), NOW())`, [name, description, color, userId]
        );

        res.status(201).json(tagDecorator({ name, description, color }));

    } catch (error) {
        res.status(500).json(error);
    }
}

const update = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { name, description, color } = req.body;

        const [[tag], [exists]] = await Promise.all([
            db.execute(
                `SELECT id FROM tags WHERE id = ? AND user_id = ?`, [id, userId]
            ),
            db.execute(
                `SELECT id, name FROM tags WHERE name = ? AND user_id = ? AND id != ?`, [name, userId, id]
            )
        ]);

        if (!tag.length) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        if (exists.length) {
            return res.status(400).json({
                message: "Ya existe una etiqueta con ese nombre"
            });
        }

        await db.execute(
            `UPDATE tags  SET name=?, description=?, color=?, updated_at=NOW() WHERE id=? AND user_id=?`, [name, description, color, id, userId]
        );

        res.json(tagDecorator({ name, description, color }));

    } catch (error) {
        res.status(500).json(error);
    }
}

const destroy = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        const [tag] = await db.execute(
            `SELECT id FROM tags WHERE id = ? AND user_id = ?`, [id, userId]
        );

        if (!tag.length) {
            return res.status(404).json({ message: "Etiqueta no encontrada" });
        }

        await db.execute(`DELETE FROM tags WHERE id=? AND user_id=?`, [id, userId]);

        res.json({ message: "Etiqueta eliminada correctamente" });

    } catch (error) {
        res.status(500).json(error);
    }
}

module.exports = {
    index,
    show,
    store,
    update,
    destroy
};
