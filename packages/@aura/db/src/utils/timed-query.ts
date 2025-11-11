import { Logger } from '@aura/backend-common';
import { Timed } from '@aura/decorators';
import { Container } from '@aura/di';

/**
 * Decorator that warns when database queries exceed a duration threshold.
 *
 * For options, see `@aura/decorators/src/timed.ts`.
 *
 * @example
 * ```ts
 * @Service()
 * class UserRepository {
 *   @TimedQuery()
 *   async findUsers() {
 *     // will log warning if execution takes > 100ms
 *   }
 *
 *   @TimedQuery({ threshold: 50, logArgs: true })
 *   async findUserById(id: string) {
 *     // will log warning if execution takes >50ms, including args
 *   }
 * }
 * ```
 */
export const TimedQuery = Timed(Container.get(Logger), 'Slow database query');
