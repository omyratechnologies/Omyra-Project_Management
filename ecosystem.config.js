module.exports = {
  apps: [
    {
      name: 'omyra-backend',
      script: 'dist/server.js',
      cwd: './backend',
      instances: 1,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'development',
        PORT: 5000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      // Production optimizations
      max_memory_restart: '1G',
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      
      // Auto restart on file changes (disable in production)
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      
      // Health monitoring
      min_uptime: '10s',
      max_restarts: 10,
      
      // Environment specific settings
      kill_timeout: 5000,
      listen_timeout: 8000,
      
      // Cluster mode for production scaling
      instances: process.env.NODE_ENV === 'production' ? 'max' : 1,
      
      // Advanced PM2 features
      merge_logs: true,
      autorestart: true,
      
      // Graceful shutdown
      kill_retry_time: 100
    }
  ],

  deploy: {
    production: {
      user: 'deploy',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'your-git-repo-url',
      path: '/var/www/omyra-project-nexus',
      'pre-deploy-local': '',
      'post-deploy': 'cd backend && npm ci --only=production && npm run build:production && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
