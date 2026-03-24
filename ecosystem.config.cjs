module.exports = {
  apps: [
    {
      name: "intel-hub",
      script: "server.js",
      node_args: "--expose-gc --max-old-space-size=4096",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "4500M", // PM2 safety net above the app's 4GB soft cap
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      // Graceful shutdown
      kill_timeout: 5000,
      listen_timeout: 10000,
      // Logging
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      error_file: "logs/error.log",
      out_file: "logs/output.log",
      merge_logs: true,
      // Restart policy
      max_restarts: 10,
      min_uptime: "10s",
      restart_delay: 2000,
    },
  ],
};
