import { motion } from 'framer-motion';
import { GraduationCap, Users, MoreVertical } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SchoolClass } from '@/types/school';

export function ClassCard({ cls, index = 0, onClick }: { cls: SchoolClass; index?: number; onClick?: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card hover className="cursor-pointer p-5" onClick={onClick}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">{cls.name}</h3>
              <Badge tone="neutral" className="mt-1">{cls.level}</Badge>
            </div>
          </div>
          <button onClick={(e) => e.stopPropagation()} className="rounded-lg p-1.5 text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-700" aria-label="Class actions">
            <MoreVertical className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-ink-400">
          <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{cls.student_count} students</span>
          <span>{cls.class_teacher_name ?? 'No teacher assigned'}</span>
        </div>
        <p className="mt-2 text-[10px] text-ink-300">Academic year {cls.academic_year}</p>
      </Card>
    </motion.div>
  );
}
