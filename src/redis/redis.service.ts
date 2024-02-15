import { Injectable, Global } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';
import * as dotenv from 'dotenv';

dotenv.config();

@Global()
@Injectable()
export class RedisService {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            password: process.env.REDIS_PASS,
            socket: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT)
            }
        });
        if (!this.client.isOpen)
            this.client.connect();

        this.client.on('connect', () => {
            console.log('Redis connected');
        });
        this.client.on('disconnect', () => {
            console.log('Redis disconnected, connecting again....');
        });
        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
        });
    }

    async set(key: string, value: string): Promise<void> {
        //await this.client.connect();
        return new Promise((resolve, reject) => {
            this.client.set(key, value)
                .then(() => resolve())
                .catch(err => reject(err))
        });
    }

    async get(key: string): Promise<string | null> {
        return new Promise((resolve, reject) => {
            this.client.get(key)
                .then((response) => resolve(JSON.parse(response)))
                .catch(err => reject('Error occurred in Redis get operation: ' + err))
        })

    }
}
