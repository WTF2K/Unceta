const fs = require('fs');
const path = require('path');

const sourceDirectory = path.join(__dirname, '../uploads');
const targetDirectory = process.env.UPLOAD_DIR || sourceDirectory;

if (path.resolve(sourceDirectory) !== path.resolve(targetDirectory)) {
  fs.mkdirSync(targetDirectory, { recursive: true });

  if (fs.existsSync(sourceDirectory)) {
    for (const entry of fs.readdirSync(sourceDirectory, { withFileTypes: true })) {
      if (!entry.isFile()) continue;

      const source = path.join(sourceDirectory, entry.name);
      const target = path.join(targetDirectory, entry.name);
      if (!fs.existsSync(target)) fs.copyFileSync(source, target);
    }
  }
}