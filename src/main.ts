import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as _cluster from 'cluster';
const cluster = _cluster as unknown as _cluster.Cluster;
import { availableParallelism } from 'os';
import * as dotenv from 'dotenv';
import { proxyRequest } from './loadbalancer';
import { NestExpressApplication } from '@nestjs/platform-express';
import { json } from 'express';

dotenv.config();

async function bootstrap() {
  let currentPort: number = Number(process.env.PORT);
  const cpus = availableParallelism();
  if (cluster.isPrimary) {
    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker) => {
      console.log(`Worker ${worker.process.pid} died`);
      worker.process.kill();
    });
  } else {

    currentPort = currentPort + cluster.worker.id - 1;
    const app = await NestFactory.create<NestExpressApplication>(AppModule,
      { rawBody: true });

    app.enableCors({ origin: '*' });
    app.use(json());
    app.use((req, res, next) => {
      if (req.headers.host === 'localhost:4000') {
        proxyRequest(req, res)
      } else {
        next();
      }
    });
    await app.listen(currentPort, 'localhost');

    console.log(`Application (PID:${process.pid}) is running on: ${await app.getUrl()}`);
  }
}

bootstrap();
