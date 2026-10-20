import { Router } from 'express';
import { getHealth, getReady, getAggregatedStatus } from '../controllers/health.controller.js';
import {getOllamaHealth,getOllamaModels,generatePromptResponse,} from '../controllers/ollama.controller.js';
import {encodeText,getSupportedTokenizers,} from '../controllers/tokenizer.controller.js';

const router = Router();

// A. Health check
router.get('/health', getHealth);

// F. Readiness check
router.get('/health/ready', getReady);

// D. Aggregated application status
router.get('/status', getAggregatedStatus);

// B. Ollama Health
router.get('/ollama/health', getOllamaHealth);

// C. Ollama Models
router.get('/ollama/models', getOllamaModels);

// E. Ollama Generate
router.post('/ollama/generate', generatePromptResponse);

// G. Tokenizer endpoints (Phase 2)
router.post('/tokenizer/encode', encodeText);
router.get('/tokenizer/supported', getSupportedTokenizers);

export default router;
