const db = require('../db/connection');
const { taskDecorator } = require('../decorators/task.decorator');

const index = async (req, res) => {
    try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const [tasks] = await db.execute(
            `SELECT t.*, c.id AS category_id, c.name AS category_name, GROUP_CONCAT(tags.id, '|', tags.name, '|', tags.color) AS tags
            FROM tasks t
            LEFT JOIN categories c ON c.id = t.category_id
            LEFT JOIN tags_task tt ON tt.task_id = t.id
            LEFT JOIN tags ON tags.id = tt.tag_id
            GROUP BY t.id
            ORDER BY t.created_at DESC
            LIMIT ? OFFSET ?`,
            [limit, offset]
        );

        res.json({
            page,
            limit,
            data: tasks.map(taskDecorator)
        });

    } catch (error) {
        res.status(500).json(error);
    }
};

const show = async (req, res) => {
    try {

        const { id } = req.params;

        const [tasks] = await db.execute(
            `SELECT t.*, c.id AS category_id, c.name AS category_name, GROUP_CONCAT(tags.id, '|', tags.name, '|', tags.color) AS tags
            FROM tasks t
            LEFT JOIN categories c ON c.id = t.category_id
            LEFT JOIN tags_task tt ON tt.task_id = t.id
            LEFT JOIN tags ON tags.id = tt.tag_id
            WHERE t.id = ?
            GROUP BY t.id`,
            [id]
        );

        if (!tasks.length) {
            return res.status(404).json({ message: "Tarea no encontrada" });
        }

        res.json({
            data: taskDecorator(tasks[0])
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