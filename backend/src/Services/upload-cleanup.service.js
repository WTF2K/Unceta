const fs = require('fs/promises');
const path = require('path');
const { noticias, produtos, setores } = require('../Config/database');

function getUploadPath(imageUrl) {
  if (!imageUrl) return null;
  try {
    const { pathname } = new URL(imageUrl, 'http://localhost');
    if (!pathname.startsWith('/uploads/')) return null;
    const filename = path.basename(pathname);
    if (!filename || filename !== pathname.slice('/uploads/'.length)) return null;
    return path.join(__dirname, '../../uploads', filename);
  } catch (error) {
    return null;
  }
}

async function removeImageIfUnused(imageUrl) {
  const uploadPath = getUploadPath(imageUrl);
  if (!uploadPath) return;

  const [newsCount, productCount, sectorCount] = await Promise.all([
    noticias.count({ where: { imagem: imageUrl } }),
    produtos.count({ where: { imagem: imageUrl } }),
    setores.count({ where: { imagem: imageUrl } })
  ]);
  if (newsCount || productCount || sectorCount) return;

  try {
    await fs.unlink(uploadPath);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

module.exports = { removeImageIfUnused };