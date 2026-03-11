const db = require('../db/connection');
const { categoryDecorator } = require('../decorators/category.decorator');

const index = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [categories] = await db.execute(
            `SELECT * FROM categories ORDER BY created_at DESC LIMIT ? OFFSET ?`, [limit, offset]
        );

        res.json({
            page,
            limit,
            data: categories.map(categoryDecorator)
        });

    } catch (error) {
        res.status(500).json(error);
    }
}

const show = async (req, res) => {
    try {

        const { id } = req.params;

        const [category] = await db.execute(
            `SELECT * FROM categories WHERE id = ?`, [id]
        );

        if (!category.length) {
            return res.status(404).json({ message: "Categoria no encontrada" });
        }

        res.json(categoryDecorator(category[0]));

    } catch (error) {
        res.status(500).json(error);
    }
}

const store = async (req, res) => {
    try {

        const { name, description, color } = req.body;

        if (!name || !description || !color) {
            return res.status(400).json({
                message: "name, description y color son obligatorios"
            });
        }

        const [exists] = await db.execute(
            `SELECT id FROM categories WHERE name = ?`, [name]
        );

        if (exists.length) {
            return res.status(400).json({ message: "El nombre de la categoria ya existe" });
        }

        await db.execute(
            `INSERT INTO categories (id, name, description, color, created_at, updated_at) VALUES (UUID(), ?, ?, ?, NOW(), NOW())`, [name, description, color]
        );

        res.status(201).json(categoryDecorator({ name, description, color }));

    } catch (error) {
        res.status(500).json(error);
    }
}

const update = async (req, res) => {
    try {

        const { id } = req.params;
        const { name, description, color } = req.body;

        const [category] = await db.execute(
            `SELECT id FROM categories WHERE id = ?`, [id]
        );

        if (!category.length) {
            return res.status(404).json({ message: "Categoria no encontrada" });
        }

        const [exists] = await db.execute(
            `SELECT id FROM categories WHERE name = ? AND id != ?`, [name, id]
        );

        if (exists.length) {
            return res.status(400).json({
                message: "Ya existe una categoria con ese nombre"
            });
        }

        await db.execute(
            `UPDATE categories  SET name=?, description=?, color=?, updated_at=NOW() WHERE id=?`, [name, description, color, id]
        );

        res.json(categoryDecorator({ name, description, color }));

    } catch (error) {
        res.status(500).json(error);
    }
}

const destroy = async (req, res) => {
    try {

        const { id } = req.params;

        const [category] = await db.execute(
            `SELECT id FROM categories WHERE id = ?`, [id]
        );

        if (!category.length) {
            return res.status(404).json({ message: "Categoria no encontrada" });
        }

        await db.execute(`DELETE FROM categories WHERE id=?`, [id]);

        res.json({ message: "Categoria eliminada correctamente" });

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
