const taskDecorator = (task, categories, tags) => {

    const category = categories.find(c => c.id === task.category_id) || null;

    const taskTags = tags.filter(tag => tag.task_id === task.id).map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color
    }));

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,

        category_id: task.category_id || "",

        category,

        tags: taskTags
    };
};

module.exports = {
    taskDecorator
};
