import React from 'react';
import PromptPlayground from '@/components/dashboard/PromptPlayground';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prompt Playground | LLM Lab',
  description:
    'Interactive Prompt Engineering Playground with customizable system instructions, temperature, top-p, and token constraints on local LLMs.',
};

export default function PlaygroundPage() {
  return (
    <main className="min-h-screen">
      <PromptPlayground />
    </main>
  );
}
