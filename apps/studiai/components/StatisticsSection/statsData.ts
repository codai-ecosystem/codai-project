export interface StatItem {
  value: string;
  label: string;
  icon: string;
  color: string;
}

export const statisticsData: StatItem[] = [
  {
    value: '15+',
    label: 'Courses',
    icon: '📚',
    color: 'from-[color:var(--ai-primary)] to-[color:var(--ai-primary)]/80',
  },
  {
    value: '2,500+',
    label: 'Students',
    icon: '👨‍🎓',
    color: 'from-[color:var(--ai-secondary)] to-[color:var(--ai-secondary)]/80',
  },
  {
    value: '10,000+',
    label: 'Hours of Content',
    icon: '⏱️',
    color: 'from-[color:var(--ai-accent)] to-[color:var(--ai-accent)]/80',
  },
  {
    value: '4.8',
    label: 'Average Rating',
    icon: '⭐',
    color: 'from-amber-500 to-amber-400',
  },
];
