import OpenAI from 'openai';
import { env } from '../../config/env';

// Create OpenAI instance if API key is available, otherwise null
export const openai = env.OPENAI_API_KEY ? new OpenAI({
  apiKey: env.OPENAI_API_KEY,
}) : null;

export default openai;
