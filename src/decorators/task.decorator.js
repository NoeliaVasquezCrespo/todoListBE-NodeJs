const taskDecorator = task => {

    const tags = task.tags ? task.tags.split(',').map(tag => {
        const [id, name, color] = tag.split('|');
        return { id, name, color };
    }) : [];

    return {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,

        category_id: task.category_id || "",

        category: task.category_id ? {
            id: task.category_id, 
            name: task.category_name
        } : null,

        tags
    };
};

module.exports = {
    taskDecorator
};
