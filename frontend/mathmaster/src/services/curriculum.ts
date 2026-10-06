import { get } from '@/lib/api';
import type {
  CurriculumLevel,
  CurriculumObjective,
  CurriculumStrand,
  CurriculumSubject,
  LocalProblem,
  Textbook,
  UNEBFormat,
  WorkedExample,
} from '@/types/pillar1';

export function fetchLevels(): Promise<CurriculumLevel[]> {
  return get<unknown>('/api/curriculum/levels/').then(normalizeLevels);
}

// The backend /api/curriculum/levels/ returns a flat shape:
//   [{ level: 'S1', name: 'Senior 1', subject_count: 1, subjects: ['Mathematics'] }]
// and the per-level detail endpoint nests subjects as a dict keyed by name
// with strands as a dict too. Normalize both into the CurriculumLevel tree
// the UI expects (subjects[]/strands[] as arrays) so pages never crash on
// undefined .strands.
export async function normalizeLevels(raw: unknown): Promise<CurriculumLevel[]> {
  const arr = Array.isArray(raw) ? raw : [];
  const detailed = await Promise.all(
    arr.map(async (entry: any) => {
      const code: string = entry.level ?? entry.code ?? '';
      let subjectsRaw: unknown = entry.subjects;
      // If subjects is just a list of names, fetch the real detail for the level.
      if (Array.isArray(subjectsRaw) && (subjectsRaw.length === 0 || typeof subjectsRaw[0] === 'string')) {
        try {
          const detail = await get<unknown>(`/api/curriculum/levels/${encodeURIComponent(code)}/`);
          subjectsRaw = detail;
        } catch {
          subjectsRaw = [];
        }
      }
      return {
        code,
        name: entry.name ?? code,
        subjects: normalizeSubjects(subjectsRaw),
      } satisfies CurriculumLevel;
    }),
  );
  return detailed;
}

function normalizeSubjects(raw: unknown): CurriculumSubject[] {
  if (!raw) return [];
  // Dict keyed by subject name: { Mathematics: { strands: { Algebra: {...} } } }
  if (!Array.isArray(raw) && typeof raw === 'object') {
    return Object.entries(raw as Record<string, any>).map(([name, value]) => ({
      code: value?.code ?? name,
      name: value?.name ?? name,
      strands: normalizeStrands(value?.strands ?? value),
    }));
  }
  // Array of subject objects (or plain strings).
  return (raw as any[]).map((s) =>
    typeof s === 'string'
      ? { code: s, name: s, strands: [] }
      : { code: s.code ?? s.name, name: s.name ?? s.code, strands: normalizeStrands(s.strands ?? []) },
  );
}

function normalizeStrands(raw: unknown): CurriculumStrand[] {
  if (!raw) return [];
  const entries: [string, any][] = Array.isArray(raw)
    ? (raw as any[]).map((s) => [s.name ?? s.code, s])
    : Object.entries(raw as Record<string, any>);
  return entries.map(([key, value]) => ({
    code: value?.code ?? key,
    name: value?.name ?? key,
    level: value?.level ?? '',
    subject: value?.subject ?? '',
    objectives: (value?.objectives ?? []).map(normalizeObjective),
  }));
}

function normalizeObjective(obj: any): CurriculumObjective {
  return {
    code: obj?.code ?? '',
    level: obj?.level ?? '',
    subject: obj?.subject ?? '',
    strand: obj?.strand ?? '',
    title: obj?.title ?? obj?.text ?? '',
    description: obj?.description ?? '',
    difficulty: obj?.difficulty ?? 'easy',
    estimated_hours: obj?.estimated_hours ?? 0,
    workbook_refs: (obj?.workbook_refs ?? []).map((ref: any) =>
      typeof ref === 'string' ? ref : `${ref.textbook} (${ref.publisher}, p.${ref.page})`,
    ),
    misconceptions: obj?.misconceptions ?? obj?.common_misconceptions ?? [],
  };
}

export function fetchLevel(level: string): Promise<CurriculumLevel> {
  return get<CurriculumLevel>(`/api/curriculum/levels/${level}/`);
}

export function fetchObjective(code: string): Promise<CurriculumObjective> {
  return get<CurriculumObjective>(`/api/curriculum/objectives/${code}/`);
}

export function fetchStrand(level: string, code: string): Promise<CurriculumStrand> {
  return get<CurriculumStrand>(`/api/curriculum/strands/${level}/${code}/`);
}

export function fetchTextbooks(level: string): Promise<Textbook[]> {
  return get<Textbook[]>('/api/curriculum/textbooks/', { params: { level } });
}

export function fetchWorkedExamples(code: string): Promise<WorkedExample[]> {
  return get<WorkedExample[]>('/api/curriculum/worked-examples/', { params: { code } });
}

export function fetchLocalProblems(code: string, difficulty?: string): Promise<LocalProblem[]> {
  return get<LocalProblem[]>('/api/curriculum/local-problems/', { params: { code, difficulty } });
}

export function fetchUNEBFormat(exam = 'UCE'): Promise<UNEBFormat> {
  return get<UNEBFormat>('/api/curriculum/uneb-format/', { params: { exam } });
}

export function searchObjectives(q: string): Promise<CurriculumObjective[]> {
  return get<CurriculumObjective[]>('/api/curriculum/search/', { params: { q } });
}
