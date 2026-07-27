import Redis, { RedisKey } from 'ioredis';
import env from './env.config';

//remove when redis server is up

// interface Redis {
//   obj: Record<string, any>;
//   set(key: string, value: string | Buffer | number): boolean;
//   get(key: string): string;
//   expire(key: string, seconds: number): boolean;
//   del(key: string): boolean;
// }

// type RedisKey = string;

// let redisClient: Redis | null = null;

// export function getRedisClient(): Redis {
//   if (!redisClient) {
//     redisClient = {
//       obj: {},
//       set(key: string, value: string | Buffer | number): boolean {
//         this.obj[key] = value;
//         return true;
//       },
//       get(key: string): string {
//         return this.obj[key];
//       },
//       expire(key: string, seconds: number): boolean {
//         setTimeout(() => {
//           this.del(key);
//         }, seconds * 1000);
//         return true;
//       },
//       del(key: string): boolean {
//         delete this.obj[key];
//         return true;
//       },
//     };
//   }

//   return redisClient;
// }

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
      // add other options if needed
    });

    redisClient.on('connect', () => {
      console.log('Redis client connected');
    });

    redisClient.on('error', (err) => {
      console.error('Redis client error:', err);
    });
  }
  return redisClient;
}

export async function setRedisKey(
  key: RedisKey,
  value: string | Buffer | number,
) {
  const redis = getRedisClient();
  redis.set(key, value);
  redis;
}

export async function getRedisKey(key: RedisKey) {
  const redis = getRedisClient();
  const data = await redis.get(key);
  return data;
}

export async function setRedisExpiry(key: RedisKey, seconds: number = 1800) {
  const redis = getRedisClient();
  await redis.expire(key, seconds);
  return true;
}

export async function destroyRediskey(key: RedisKey | undefined) {
  if (key) {
    const redis = getRedisClient();
    await redis.del(key);
    return true;
  }
}

export async function updateRediskey(
  key: RedisKey | undefined,
  value: string | Buffer | number,
) {
  if (key) {
    setRedisKey(key, value);
  }
}
