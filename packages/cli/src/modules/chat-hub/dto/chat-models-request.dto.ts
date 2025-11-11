import { chatModelsRequestSchema } from '@aura/api-types';
import { Z } from 'zod-class';

export class ChatModelsRequestDto extends Z.class(chatModelsRequestSchema.shape) {}
