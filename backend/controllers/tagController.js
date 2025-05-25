const Tag = require('../models/tags');

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll();
    res.json(tags);
  } catch (err) {
    console.error('Error fetching tags:', err);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
};

exports.createTag = async (req, res) => {
  const { name } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ error: 'Tag name is required' });
  }

  try {
    const existing = await Tag.findByName(name);
    if (existing) {
      return res.status(409).json({ error: 'Tag already exists' });
    }

    const tag = await Tag.create(name);
    res.status(201).json(tag);
  } catch (err) {
    console.error('Error creating tag:', err);
    res.status(500).json({ error: 'Failed to create tag' });
  }
};
