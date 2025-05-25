const Tag = require('../models/tags');

const tagController = {
  async getAllTags(req, res) {
    try {
        const tags = await Tag.findAll();
        res.json(tags);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
  },

  async createTag(req, res) {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name is required' });

    const existing = await Tag.findByName(name);
    if (existing) return res.status(409).json({ error: 'Tag already exists' });

    const tag = await Tag.create(name);
    res.status(201).json(tag);
  }
};

module.exports = tagController;
