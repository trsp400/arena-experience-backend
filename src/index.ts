import Fastify from 'fastify';

const server = Fastify({ logger: true });

server.get('/', async (request, reply) => {
  return { hello: 'world' };
});

const start = async () => {
  try {
    await server.listen({ port: 3000 });
    server.log.info(`server listening on ${server?.server?.address()?.toString()}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();