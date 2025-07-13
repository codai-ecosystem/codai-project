import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';

// Create Anthropic instance if API key is available, otherwise null
export const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
}) : null;

export default anthropic;
