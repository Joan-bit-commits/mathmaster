import type { LucideIcon } from 'lucide-react';
import { Stat } from '@/components/ui/stat';

type StatItem = { title: string; value: string | number; icon: LucideIcon; trend?: { value: string; direction: 'up' | 'down' } };
export function StatsGrid({ stats }: { stats: StatItem[] }) { return <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{stats.map((stat) => <Stat key={stat.title} {...stat} />)}</div>; }
