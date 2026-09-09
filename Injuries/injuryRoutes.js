const express = require('express');
const Injury = require('../Database/models/Injury');
const router = express.Router();

router.get('/', async (req, res) => res.json(await Injury.find().populate('playerId')));
router.post('/', async (req, res) => res.json(await Injury.create(req.body)));
router.delete('/:id', async (req, res) => {
  await Injury.findByIdAndDelete(req.params.id);
  res.json({ msg: 'deleted' });
});
module.exports = router;