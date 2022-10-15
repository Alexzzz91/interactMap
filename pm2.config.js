export default {
    apps: [
      {
        name: "server",
        script: "server.js",
        node_args: [
          "--stack-trace-limit=150",
        ],
  
        // // cluster mode
        // instances: 'max',
        // exec_mode: 'cluster',
  
        exec_mode: "fork",
        instances: 1,
  
        // logs
        combine_logs: true,
  
        // restart
        exp_backoff_restart_delay: 200,
        max_restarts: 100,
        restart_delay: 30,
        watch: false,
        max_memory_restart: "500M",
        env: {
          NODE_ENV: "production",
        },
        env_production: {
          NODE_ENV: "production",
        },
      },
    ],
  };