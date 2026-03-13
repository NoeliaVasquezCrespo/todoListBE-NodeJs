const db = require('../db/connection');
const { taskDecorator } = require('../decorators/task.decorator');

const index = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [tasks] = await db.execute(
            `SELECT * FROM tasks ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        const categoryIds = [...new Set(tasks.map(t => t.category_id))];

        let categories = [];

        if (categoryIds.length) {
            const params = categoryIds.map(() => '?').join(',');

            const [result] = await db.execute(
                `SELECT id, name FROM categories WHERE id IN (${params})`,
                categoryIds
            );
            categories = result;
        }

        const taskIds = tasks.map(t => t.id);

        let tags = [];

        if (taskIds.length) {
            const params = taskIds.map(() => '?').join(',');

            const [result] = await db.execute(
                `SELECT tags.id, tags.name, tags.color, tags_task.task_id
                 FROM tags
                 JOIN tags_task ON tags_task.tag_id = tags.id
                 WHERE tags_task.task_id IN (${params})`,
                taskIds
            );
            tags = result;
        }

        res.json({
            page,
            limit,
            data: tasks.map(task => taskDecorator(task, categories, tags))
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

const show = async (req, res) => {
    try {

        const { id } = req.params;

        const [tasks] = await db.execute(
            `SELECT * FROM tasks WHERE id = ?`,
            [id]
        );

        if (!tasks.length) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        const task = tasks[0];

        let categories = [];
        let tags = [];

        if (task.category_id) {
            const [result] = await db.execute(`SELECT id, name FROM categories WHERE id = ?`, [task.category_id]);
            categories = result;
        }

        const [result] = await db.execute(
            `SELECT tags.id, tags.name, tags.color, tags_task.task_id
             FROM tags
             JOIN tags_task ON tags_task.tag_id = tags.id
             WHERE tags_task.task_id = ?`,
            [id]
        );

        tags = result;

        res.json({
            data: taskDecorator(task, categories, tags)
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

const store = async (req, res) => {
    try {

        const { title, description, category_id, tags } = req.body;

        if (!title) {
            return res.status(400).json({
                message: "title es obligatorio"
            });
        }

        await db.execute(
            `INSERT INTO tasks (id, title, description, status, category_id, created_at, updated_at) VALUES (UUID(), ?, ?, false, ?, NOW(), NOW())`,
            [title, description, category_id]
        );

        const [[task]] = await db.execute(`SELECT id FROM tasks ORDER BY created_at DESC LIMIT 1`);

        if (tags && tags.length) {
            await Promise.all(
                tags.map(tagId =>
                    db.execute(`INSERT INTO tags_task (tag_id, task_id) VALUES (?, ?)`, [tagId, task.id])
                )
            );
        }

        res.status(201).json({
            message: "Tarea creada correctamente"
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

const update = async (req, res) => {
    try {

        const { id } = req.params;
        const { title, description, status, category_id, tags } = req.body;

        const [task] = await db.execute(
            `SELECT id FROM tasks WHERE id = ?`, [id]
        );

        if (!task.length) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        await db.execute(`UPDATE tasks SET title = ?, description = ?, status = ?, category_id = ?, updated_at = NOW() WHERE id = ?`, [title, description, status, category_id, id]);

        if (tags) {
            await db.execute(
                `DELETE FROM tags_task WHERE task_id = ?`, [id]
            );

            await Promise.all(
                tags.map(tagId =>
                    db.execute(
                        `INSERT INTO tags_task (tag_id, task_id) VALUES (?, ?)`, [tagId, id]
                    )
                )
            );
        }

        res.json({
            message: "Tarea actualizada correctamente"
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

const destroy = async (req, res) => {
    try {

        const { id } = req.params;

        const [task] = await db.execute(
            `SELECT id FROM tasks WHERE id = ?`, [id]
        );

        if (!task.length) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        await db.execute(
            `DELETE FROM tasks WHERE id = ?`, [id]
        );

        res.json({
            message: "Tarea eliminada correctamente"
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

module.exports = {
    index,
    show,
    store,
    update,
    destroy
};