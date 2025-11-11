export type RedisClientType = N8nRedisClientType | BullRedisClientType;

/**
 * Redis client used by aura.
 *
 * - `subscriber(aura)` to listen for messages from scaling mode pubsub channels
 * - `publisher(aura)` to send messages into scaling mode pubsub channels
 * - `cache(aura)` for caching operations (variables, resource ownership, etc.)
 */
type N8nRedisClientType = 'subscriber(aura)' | 'publisher(aura)' | 'cache(aura)';

/**
 * Redis client used internally by Bull. Suffixed with `(bull)` at `ScalingService.setupQueue`.
 *
 * - `subscriber(bull)` for event listening
 * - `client(bull)` for general queue operations
 * - `bclient(bull)` for blocking operations when processing jobs
 */
type BullRedisClientType = 'subscriber(bull)' | 'client(bull)' | 'bclient(bull)';
