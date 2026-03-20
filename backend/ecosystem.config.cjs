module.exports = {
  apps: [
    {
      name: 'shopsmart-backend',
      script: 'src/index.js',
      cwd: '/app/backend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        BACKEND_PORT: '5001',
        FRONTEND_URL: 'http://localhost:5173',
        DATABASE_URL: 'file:/data/dev.db'
      }
    }
  ]
};
