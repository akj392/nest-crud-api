import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as _cluster from 'cluster';
const cluster = _cluster as unknown as _cluster.Cluster;
import { availableParallelism } from 'node:os';
import * as dotenv from 'dotenv';

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
    });
  } else {
    currentPort = currentPort + cluster.worker.id;
    const app = await NestFactory.create(AppModule);
    await app.listen(currentPort, 'localhost');
    // console.log(`Cluster server has started on ${process.pid}`);
    console.log(`Application is running on: ${await app.getUrl()}`);
  }
}

bootstrap();
