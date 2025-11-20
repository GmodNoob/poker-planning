
import Redis from 'ioredis'

let redis: Redis | null = null

export function getRedisClient(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL

    if (!redisUrl) {
      throw new Error('REDIS_URL environment variable is required')
    }

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      tls: redisUrl.includes('rediss://') ? {} : undefined,
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('✅ Connected to Redis')
    })
  }

  return redis
}

export async function closeRedis(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}
