import Fastify from 'fastify';
import dotenv from 'dotenv';
import cors from '@fastify/cors'
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import healthCheckRoutes from './routes/healthCheckRoutes';
import eventParticipationRoutes from './routes/eventParticipationRoutes';
import { authMiddleware } from './middlewares/authMiddleware';

dotenv.config();

const NODE_ENV = process.env.NODE_ENV || 'development'
const now = () => Date.now();

const envToLogger: any = {
  development: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  },
  production: {
    transport: {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid',
      },
    },
  },
  test: false,
}

const server = Fastify({ logger: envToLogger[NODE_ENV] ?? true });

server.register(cors)

server.addHook("onRequest", (req, reply: any, done) => {
  reply.startTime = now();
  req.log.info({ url: req.raw.url, id: req.id }, "received request");
  done();
});

server.addHook("onResponse", (req, reply: any, done) => {
  req.log.info(
    {
      url: req.raw.url, // add url to response as well for simple correlating
      statusCode: reply.raw.statusCode,
      durationMs: now() - reply.startTime, // recreate duration in ms - use process.hrtime() - https://nodejs.org/api/process.html#process_process_hrtime_bigint for most accuracy
    },
    "request completed"
  );
  done();
});

server.addHook('preHandler', authMiddleware);

userRoutes(server);
eventRoutes(server);
healthCheckRoutes(server);
eventParticipationRoutes(server);

const port = parseInt(process.env.PORT ?? "3001", 10);

const start = async () => {
  try {
    await server.listen({ port: port, host: "0.0.0.0" });
    server.log.info(`server listening on ${process.env.PORT}`);
    server.log.info(`Address ${server?.server?.address()}`)
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();