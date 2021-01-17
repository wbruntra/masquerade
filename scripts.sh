knex migrate:latest --env production

pm2 start src/server.js --node-args="-r esm"