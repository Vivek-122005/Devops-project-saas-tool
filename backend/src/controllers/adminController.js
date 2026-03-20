const productService = require('../lib/productService');

async function getDashboard(_request, response, next) {
  try {
    const dashboard = await productService.getAdminDashboard();
    response.json(dashboard);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboard
};
