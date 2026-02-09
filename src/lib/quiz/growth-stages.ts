import { GrowthStageConfig } from './types';

export const growthStages: GrowthStageConfig[] = [
  {
    id: 'startup',
    name: 'Starting Up',
    emoji: '🌱',
    description: 'You\'re in the early stages, building your foundation and finding your first customers.',
    revenue: '$0 - $1K/month'
  },
  {
    id: 'growing',
    name: 'Growing',
    emoji: '📈',
    description: 'You have some traction but need systems and consistency to scale further.',
    revenue: '$1K - $5K/month'
  },
  {
    id: 'scaling',
    name: 'Scaling',
    emoji: '⭐',
    description: 'You\'re established and ready to optimize, delegate, and scale to the next level.',
    revenue: '$5K+/month'
  }
];