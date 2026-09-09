const express = require('express');
const Training = require('../Database/models/Training');
const router = express.Router();

router.get('/', async (req, res) => res.json(await Training.find()));
router.post('/', async (req, res) => res.json(await Training.create(req.body)));
router.delete('/:id', async (req, res) => {
  await Training.findByIdAndDelete(req.params.id);
  res.json({ msg: 'deleted' });
});
module.exports = router;