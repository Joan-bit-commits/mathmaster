// ─── Curriculum types ──────────────────────────────────────────

export type CurriculumLevel = {
  code: string;
  name: string;
  subjects: CurriculumSubject[];
};

export type CurriculumSubject = {
  code: string;
  name: string;
  strands: CurriculumStrand[];
};

export type CurriculumStrand = {
  code: string;
  name: string;
  level: string;
  subject: string;
  objectives: CurriculumObjective[];
};

export type CurriculumObjective = {
  code: string;
  level: string;
  subject: string;
  strand: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimated_hours: number;
  workbook_refs: string[];
  misconceptions: string[];
};

export type WorkedExample = {
  id: string;
  code: string;
  problem: string;
  solution_steps: SolutionStep[];
  final_answer: string;
};

export type SolutionStep = {
  step_number: number;
  text: string;
  mark: 'M1' | 'A1' | 'B1' | 'cao';
  explanation?: string;
};

export type LocalProblem = {
  id: string;
  code: string;
  difficulty: 'easy' | 'medium' | 'hard';
  context: string;
  problem: string;
  answer: string;
  context_tags: string[];
};

export type UNEBFormat = {
  exam: string;
  paper_count: number;
  total_marks: number;
  duration_minutes: number;
  sections: { name: string; marks: number; question_count: number; description: string }[];
};

export type Textbook = {
  id: string;
  title: string;
  publisher: string;
  level: string;
  subject: string;
  approved: boolean;
};

// ─── Document types ────────────────────────────────────────────

export type DocumentItem = {
  id: string;
  title: string;
  document_type: 'textbook' | 'past_paper' | 'notes' | 'worksheet' | 'other';
  file_url: string;
  page_count: number;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  created_at: string;
  updated_at: string;
};

export type DocumentChunk = {
  id: string;
  document_id: string;
  chunk_index: number;
  page_number: number;
  content: string;
  token_count: number;
};

export type DocumentSession = {
  id: string;
  document_id: string;
  question: string;
  message_count: number;
  created_at: string;
};

export type DocumentSessionDetail = {
  session: DocumentSession;
  messages: { id: string; role: 'user' | 'assistant'; content: string; citations?: Citation[]; created_at: string }[];
};

export type Citation = {
  chunk_id: string;
  page_number: number;
  snippet: string;
  score: number;
};

// ─── Scan types ────────────────────────────────────────────────

export type ScanJob = {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  image_url: string;
  problem_text: string;
  solution: string;
  solution_steps: SolutionStep[];
  final_answer: string;
  confidence: number;
  topic_code: string;
  topic_name: string;
  textbook_ref: string;
  context_tags: string[];
  created_at: string;
};

// ─── Past Paper types ──────────────────────────────────────────

export type PastPaper = {
  id: string;
  title: string;
  year: number;
  subject: string;
  difficulty: string;
  file_url: string;
  processing_status: 'pending' | 'processing' | 'ready' | 'failed';
  question_count: number;
  created_at: string;
};

export type ExtractedQuestion = {
  id: string;
  question_number: number;
  text: string;
  marks: number;
  answer?: string;
  topic_code?: string;
};
