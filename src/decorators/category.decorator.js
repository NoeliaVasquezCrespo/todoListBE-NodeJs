const categoryDecorator = category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    color: category.color
})

module.exports = {
    categoryDecorator
};
