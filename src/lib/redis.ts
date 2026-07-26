import { Redis as UpstashRedis } from '@upstash/redis';
import IORedis from 'ioredis';

export interface VoteEvent {
  id: string;
  candidatoId?: string;
  grupoId?: string;
  stageId?: string;
  ip: string;
  timestamp: number;
}

const QUEUE_KEY = 'vote_queue';
const RATE_LIMIT_PREFIX = 'vote_rl:';

// Driver selection: Upstash HTTP, ioredis TCP, or in-memory fallback
let upstashClient: UpstashRedis | null = null;
let ioRedisClient: IORedis | null = null;

// In-Memory Fallback Queue (used only if no Redis env vars are set in local dev)
const memoryQueue: VoteEvent[] = [];
const memoryRateLimit = new Map<string, number>();

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redisUrl = process.env.REDIS_URL || process.env.REDIS_HOST;

if (upstashUrl && upstashToken) {
  upstashClient = new UpstashRedis({
    url: upstashUrl,
    token: upstashToken,
  });
} else if (redisUrl) {
  ioRedisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });
  ioRedisClient.connect().catch((err) => {
    console.warn('[Redis] Local ioredis connection error:', err.message);
  });
} else {
  console.warn(
    '[Redis] Nenhuma variável de ambiente de Redis configurada (UPSTASH_REDIS_REST_URL ou REDIS_URL). Utilizando fila em memória para desenvolvimento.'
  );
}

/**
 * Pushes a vote event into the Redis queue (or in-memory fallback)
 */
export async function pushVoteToQueue(vote: VoteEvent): Promise<void> {
  const serialized = JSON.stringify(vote);

  if (upstashClient) {
    await upstashClient.rpush(QUEUE_KEY, serialized);
  } else if (ioRedisClient) {
    await ioRedisClient.rpush(QUEUE_KEY, serialized);
  } else {
    memoryQueue.push(vote);
  }
}

/**
 * Pops up to `batchSize` vote events from the Redis queue
 */
export async function popVoteBatch(batchSize: number = 500): Promise<VoteEvent[]> {
  if (upstashClient) {
    const items = await upstashClient.lpop<string[]>(QUEUE_KEY, batchSize);
    if (!items) return [];
    const list = Array.isArray(items) ? items : [items];
    return list.map((item) => (typeof item === 'string' ? JSON.parse(item) : item));
  } else if (ioRedisClient) {
    const pipeline = ioRedisClient.pipeline();
    for (let i = 0; i < batchSize; i++) {
      pipeline.lpop(QUEUE_KEY);
    }
    const results = await pipeline.exec();
    if (!results) return [];

    const votes: VoteEvent[] = [];
    for (const [err, res] of results) {
      if (!err && res && typeof res === 'string') {
        try {
          votes.push(JSON.parse(res));
        } catch {
          // Ignore invalid JSON
        }
      }
    }
    return votes;
  } else {
    // Memory fallback
    return memoryQueue.splice(0, batchSize);
  }
}

/**
 * Re-queues unprocessed votes back into Redis (in case PocketBase fails)
 */
export async function requeueVotes(votes: VoteEvent[]): Promise<void> {
  if (!votes || votes.length === 0) return;

  const serializedList = votes.map((v) => JSON.stringify(v));

  if (upstashClient) {
    await upstashClient.rpush(QUEUE_KEY, ...serializedList);
  } else if (ioRedisClient) {
    await ioRedisClient.rpush(QUEUE_KEY, ...serializedList);
  } else {
    memoryQueue.push(...votes);
  }
}

/**
 * Gets current size of the vote queue
 */
export async function getQueueSize(): Promise<number> {
  if (upstashClient) {
    return await upstashClient.llen(QUEUE_KEY);
  } else if (ioRedisClient) {
    return await ioRedisClient.llen(QUEUE_KEY);
  } else {
    return memoryQueue.length;
  }
}

/**
 * Rate Limiter per IP using Redis SET NX EX (or in-memory fallback)
 */
export async function checkRateLimit(
  ip: string,
  cooldownSeconds: number = 3
): Promise<{ allowed: boolean; remainingSeconds: number }> {
  const key = `${RATE_LIMIT_PREFIX}${ip}`;

  if (upstashClient) {
    const result = await upstashClient.set(key, '1', {
      nx: true,
      ex: cooldownSeconds,
    });
    if (result === 'OK') {
      return { allowed: true, remainingSeconds: 0 };
    }
    const ttl = await upstashClient.ttl(key);
    return { allowed: false, remainingSeconds: ttl > 0 ? ttl : cooldownSeconds };
  } else if (ioRedisClient) {
    const result = await ioRedisClient.set(key, '1', 'EX', cooldownSeconds, 'NX');
    if (result === 'OK') {
      return { allowed: true, remainingSeconds: 0 };
    }
    const ttl = await ioRedisClient.ttl(key);
    return { allowed: false, remainingSeconds: ttl > 0 ? ttl : cooldownSeconds };
  } else {
    const now = Date.now();
    const lastVote = memoryRateLimit.get(ip);
    if (lastVote && now - lastVote < cooldownSeconds * 1000) {
      const remaining = Math.ceil((cooldownSeconds * 1000 - (now - lastVote)) / 1000);
      return { allowed: false, remainingSeconds: remaining };
    }
    memoryRateLimit.set(ip, now);
    return { allowed: true, remainingSeconds: 0 };
  }
}

const VOTING_STATUS_KEY = 'voting_status';
let memoryVotingStatus: 'open' | 'closed' = 'open';

/**
 * Busca o status soberano da votação no Redis ('open' | 'closed')
 */
export async function getVotingStatus(): Promise<'open' | 'closed'> {
  try {
    if (upstashClient) {
      const val = await upstashClient.get<string>(VOTING_STATUS_KEY);
      if (val === 'closed') return 'closed';
      if (val === 'open') return 'open';
    } else if (ioRedisClient) {
      const val = await ioRedisClient.get(VOTING_STATUS_KEY);
      if (val === 'closed') return 'closed';
      if (val === 'open') return 'open';
    }
  } catch (err) {
    console.warn('[Redis] Erro ao ler voting_status do Redis:', err);
  }
  return memoryVotingStatus;
}

/**
 * Define o status soberano da votação no Redis ('open' | 'closed')
 */
export async function setVotingStatus(status: 'open' | 'closed'): Promise<void> {
  memoryVotingStatus = status;
  try {
    if (upstashClient) {
      await upstashClient.set(VOTING_STATUS_KEY, status);
    } else if (ioRedisClient) {
      await ioRedisClient.set(VOTING_STATUS_KEY, status);
    }
  } catch (err) {
    console.warn('[Redis] Erro ao gravar voting_status no Redis:', err);
  }
}

const VOTING_CONFIG_KEY = 'active_voting_config';
let memoryVotingConfig: any = null;

export async function getConfigFromRedis(): Promise<any> {
  try {
    if (upstashClient) {
      const val = await upstashClient.get<any>(VOTING_CONFIG_KEY);
      if (val) return typeof val === 'string' ? JSON.parse(val) : val;
    } else if (ioRedisClient) {
      const val = await ioRedisClient.get(VOTING_CONFIG_KEY);
      if (val) return typeof val === 'string' ? JSON.parse(val) : val;
    }
  } catch (err) {
    console.warn('[Redis] Erro ao ler active_voting_config:', err);
  }
  return memoryVotingConfig;
}

export async function setConfigInRedis(config: any): Promise<void> {
  memoryVotingConfig = config;
  try {
    const valStr = JSON.stringify(config);
    if (upstashClient) {
      await upstashClient.set(VOTING_CONFIG_KEY, valStr);
    } else if (ioRedisClient) {
      await ioRedisClient.set(VOTING_CONFIG_KEY, valStr);
    }
  } catch (err) {
    console.warn('[Redis] Erro ao gravar active_voting_config:', err);
  }
}

