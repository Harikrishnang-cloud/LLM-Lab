import React from 'react';
import TokenizerPlayground from '@/components/dashboard/TokenizerPlayground';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tokenizer Lab | LLM Lab',
  description: 'Interactive subword tokenization playground using the authentic Llama 3 BPE tokenizer with live token IDs and chip visualization.',
};

export default function TokenizerPage() {
  return (
    <main className="min-h-screen">
      <TokenizerPlayground />
    </main>
  );
}
