import type { CanvasEventBusEvents } from './canvas.types';
import { createEventBus } from '@aura/utils/event-bus';

export const canvasEventBus = createEventBus<CanvasEventBusEvents>();
