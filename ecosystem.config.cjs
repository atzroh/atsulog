// pm2 settings for the standalone server, shared by restart.sh and startup.sh
module.exports = {
  apps: [
    {
      name: "atsulog",
      script: "server.js",
      cwd: __dirname,
      max_memory_restart: "300M",
      env: {
        PORT: "3000",
        // Only nginx should reach the app
        HOSTNAME: "127.0.0.1",
      },
    },
  ],
};
