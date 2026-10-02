module.exports = {
  apps: [
    {
      name: 'emergency-backend',
      cwd: './backend',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      ignore_watch: ['node_modules', 'data/ambulances.json'],
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      time: true,
    },
    {
      name: 'emergency-frontend',
      cwd: './frontend-react',
      script: 'npm',
      args: 'run dev -- --host 0.0.0.0 --port 5173',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'development',
        PORT: 5173,
      },
      env_production: {
        NODE_ENV: 'production',
        script: 'npm',
        args: 'run preview -- --host 0.0.0.0 --port 5173',
        PORT: 5173,
      },
      time: true,
    },
  ],
};
