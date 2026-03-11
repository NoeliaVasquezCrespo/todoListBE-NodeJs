const tagDecorator = tag => ({
    id: tag.id,
    name: tag.name,
    description: tag.description,
    color: tag.color
})

module.exports = {
    tagDecorator
};
