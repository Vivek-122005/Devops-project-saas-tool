function requireAdmin(request, response, next) {
  const configuredKey = process.env.ADMIN_KEY || 'socks-admin-123';
  const providedKey = request.get('x-admin-key');

  if (!providedKey || providedKey !== configuredKey) {
    response.status(401).json({
      message: 'Admin access denied. Provide a valid x-admin-key header.'
    });
    return;
  }

  next();
}

module.exports = {
  requireAdmin
};
