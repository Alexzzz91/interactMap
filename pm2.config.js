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

          //  proxy_set_header    Host $host;
          //  proxy_set_header    X-Real-IP   $remote_addr;
          //  proxy_set_header    X-Forwarded-For $proxy_add_x_forwarded_for;
          //  proxy_pass  http://127.0.0.1:8080;
          index    index.html index.htm;
          root    /home/alk/actions-runner/_work/interactMap/interactMap/dist;