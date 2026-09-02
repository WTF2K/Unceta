const { produtos, setores } = require('../Config/database');

async function getSectorProducts(req, res) {
  const sector = await setores.findByPk(req.params.id_setor);
  if (!sector) return res.status(404).json({ message: 'Sector not found.' });
  return res.status(200).json(await produtos.findAll({ where: { id_setor: sector.id_setor }, order: [['nome', 'ASC']] }));
}

async function reassignAndDelete(req, res) {
  const source = await setores.findByPk(req.params.id_setor);
  const target = await setores.findByPk(req.body.targetSectorId);
  if (!source || !target || source.id_setor === target.id_setor) return res.status(400).json({ message: 'Choose a different valid replacement sector.' });
  await produtos.update({ id_setor: target.id_setor }, { where: { id_setor: source.id_setor } });
  return res.status(200).json({ reassignedTo: target.id_setor });
}

module.exports = { getSectorProducts, reassignAndDelete };