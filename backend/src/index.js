require('dotenv').config();
const app = require('./app');
const { ensureDatabase } = require('./lib/ensureDatabase');

const port = Number(process.env.BACKEND_PORT || 5001);

ensureDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`ShopSmart API listening on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database', error);
    process.exit(1);
  });
