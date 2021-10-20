const hapi = require('hapi');

const server = hapi.server({
  port: 4000,
  host: 'localhost'
});

const main = async () => {
  await server.start();
  console.log(`Server running at ${server.info.uri}`);
};

main();