import { Server } from '@hapi/hapi';
import * as mongoose from 'mongoose';
import Painting from './models/Painting';

type PaintingPOSTRequest = {
  payload: {
    name: string;
    url: string;
    techniques: string[];
  }
}

const mongoosePath = 'mongodb://localhost:27017/test-db';

const server = new Server({
  port: 4000,
  host: 'localhost'
});

const main = async () => {
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: async (requset, reply) => {
        return `<h1>Test route</h1>`
      }
    },
    {
      method: 'GET',
      path: '/api/v1/paintings',
      handler: async (requset, reply) => {
        return Painting.find();
      }
    },
    {
      method: 'POST',
      path: '/api/v1/paintings',
      handler: async (requset: PaintingPOSTRequest, reply) => {
        const { name, url, techniques } = requset.payload;
        const painting = new Painting({
          name,
          url,
          techniques
        });
        return painting.save();
      }
    }
  ]);

  server.route({
    method: 'POST',
    path: '/signup',
    handler: function (request, h) {

      const payload = request.payload;

      // @ts-ignore
      return `Welcome ${payload.username}!`;
    }
  });

  await server.start();
  console.log(`Server running at ${server.info.uri}`);

  db();
};

const db = () => {
  mongoose.connect(mongoosePath);
  mongoose.connection.once('open', () => {
    console.log(`Connected to DB`);
  });
};

main();