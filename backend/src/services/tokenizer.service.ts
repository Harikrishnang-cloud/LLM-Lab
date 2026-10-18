import llama3Tokenizer from 'llama3-tokenizer-js';
import { TokenChunk, TokenizeResultData } from '../types/index.js';
import { AppError } from '../middleware/error.middleware.js';
import { env } from '../config/env.js';

// The LLaMA 3 vocabulary size is exactly 128,256 tokens (BPE tokenizer based on tiktoken with 128k base vocab + reserved special tokens)
const LLAMA3_VOCABULARY_SIZE = 128256;

export class TokenizerService {
  /**
   * Tokenize text using the authentic Llama 3 BPE tokenizer matching llama3 / llama3.1 / llama3.2
   */
  public tokenize(
    text: string,
    requestedModel?: string,
    includeSpecialTokens = false
  ): TokenizeResultData {
    const activeModel = requestedModel?.trim() || env.OLLAMA_DEFAULT_MODEL || 'llama3.2:1b';
    const lowerModel = activeModel.toLowerCase();

    // Verify model compatibility
    // LLaMA 3, 3.1, 3.2, 3.3 all share the 128k tiktoken-derived tokenizer
    const isLlama3Family =
      lowerModel.includes('llama3') ||
      lowerModel.includes('llama-3') ||
      lowerModel.includes('llama 3');

    if (!isLlama3Family) {
      throw new AppError(
        400,
        'UNSUPPORTED_TOKENIZER_MODEL',
        `The exact tokenizer for '${activeModel}' is not yet registered. Currently, the verified native tokenizer matches the LLaMA 3 family (e.g. 'llama3.2:1b'). Do not substitute an unverified tokenizer.`,
        {
          requestedModel: activeModel,
          supportedFamilies: ['llama3', 'llama3.1', 'llama3.2', 'llama3.3'],
        }
      );
    }

    try {
      const tokenizer = (llama3Tokenizer as any).default || llama3Tokenizer;

      // Encode using exact LLaMA 3 BPE rules
      const tokenIds: number[] = tokenizer.encode(text, {
        bos: includeSpecialTokens,
        eos: includeSpecialTokens,
      });

      // Decode each individual token ID to accurately retrieve its text representation
      const tokens: TokenChunk[] = tokenIds.map((id, index) => {
        let piece = '';
        try {
          piece = tokenizer.decode([id]);
        } catch {
          piece = `[${id}]`;
        }
        return {
          id,
          text: piece,
          index,
        };
      });

      // Calculate character count and word count
      const characterCount = text.length;
      const trimmed = text.trim();
      const wordCount = trimmed.length === 0 ? 0 : trimmed.split(/\s+/).length;

      return {
        model: activeModel,
        tokenizerName: 'Llama 3 BPE Tokenizer (tiktoken 128k vocabulary)',
        vocabularySize: LLAMA3_VOCABULARY_SIZE,
        tokenCount: tokenIds.length,
        characterCount,
        wordCount,
        tokens,
        tokenIds,
        specialTokensIncluded: includeSpecialTokens,
        notes:
          'Exact BPE tokenization matching Meta LLaMA 3 / 3.1 / 3.2. Each token ID maps to the exact vocabulary entry used by llama3.2:1b.',
      };
    } catch (err: any) {
      if (err instanceof AppError) {
        throw err;
      }
      throw new AppError(
        500,
        'TOKENIZATION_FAILED',
        `Failed to tokenize input text: ${err?.message || 'Unknown tokenizer error'}`
      );
    }
  }

  public getSupportedTokenizers(): {
    model: string;
    tokenizerName: string;
    vocabularySize: number;
    description: string;
  }[] {
    return [
      {
        model: 'llama3.2:1b',
        tokenizerName: 'Llama 3 BPE Tokenizer',
        vocabularySize: LLAMA3_VOCABULARY_SIZE,
        description: 'Byte-Pair Encoding with 128k vocabulary used by Meta LLaMA 3 / 3.1 / 3.2',
      },
    ];
  }
}

export const tokenizerService = new TokenizerService();
