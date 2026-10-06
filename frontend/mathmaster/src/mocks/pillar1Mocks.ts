import type {
  CurriculumLevel,
  DocumentItem,
  ExtractedQuestion,
  LocalProblem,
  PastPaper,
  ScanJob,
  UNEBFormat,
  WorkedExample,
} from '@/types/pillar1';

export const mockLevels: CurriculumLevel[] = [
  {
    code: 'S1',
    name: 'Senior 1',
    subjects: [
      {
        code: 'M',
        name: 'Mathematics',
        strands: [
          {
            code: 'A',
            name: 'Algebra',
            level: 'S1',
            subject: 'Mathematics',
            objectives: [
              {
                code: 'S1.M.A.1',
                level: 'S1',
                subject: 'Mathematics',
                strand: 'Algebra',
                title: 'Linear Equations',
                description: 'Solve linear equations in one variable and apply them to real-life problems.',
                difficulty: 'easy',
                estimated_hours: 4,
                workbook_refs: ['MK S1 Maths Book 1, Ch. 3', 'Peason S1, Ch. 4'],
                misconceptions: [
                  'Forgetting to balance both sides of the equation',
                  'Sign errors when moving terms across the equals sign',
                  'Confusing the order of operations when simplifying',
                ],
              },
              {
                code: 'S1.M.A.2',
                level: 'S1',
                subject: 'Mathematics',
                strand: 'Algebra',
                title: 'Indices and Powers',
                description: 'Apply laws of indices to simplify expressions.',
                difficulty: 'medium',
                estimated_hours: 3,
                workbook_refs: ['MK S1 Maths Book 1, Ch. 5'],
                misconceptions: ['Multiplying indices when the bases differ', 'Incorrectly applying the zero index law'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'S2',
    name: 'Senior 2',
    subjects: [
      {
        code: 'M',
        name: 'Mathematics',
        strands: [
          {
            code: 'N',
            name: 'Number',
            level: 'S2',
            subject: 'Mathematics',
            objectives: [
              {
                code: 'S2.M.N.1',
                level: 'S2',
                subject: 'Mathematics',
                strand: 'Number',
                title: 'HCF and LCM',
                description: 'Find HCF and LCM of numbers using prime factorisation.',
                difficulty: 'easy',
                estimated_hours: 3,
                workbook_refs: ['MK S2 Maths Book 2, Ch. 2'],
                misconceptions: ['Confusing HCF with LCM', 'Not using prime factorisation correctly'],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'S3',
    name: 'Senior 3',
    subjects: [
      {
        code: 'M',
        name: 'Mathematics',
        strands: [
          {
            code: 'T',
            name: 'Trigonometry',
            level: 'S3',
            subject: 'Mathematics',
            objectives: [
              {
                code: 'S3.M.T.1',
                level: 'S3',
                subject: 'Mathematics',
                strand: 'Trigonometry',
                title: 'Sine and Cosine Rules',
                description: 'Apply sine and cosine rules to solve triangles.',
                difficulty: 'hard',
                estimated_hours: 5,
                workbook_refs: ['MK S3 Maths Book 3, Ch. 8'],
                misconceptions: ['Using Pythagoras on non-right triangles', 'Confusing when to use sine vs cosine rule'],
              },
            ],
          },
        ],
      },
    ],
  },
];

export const mockWorkedExamples: WorkedExample[] = [
  {
    id: 'we-1',
    code: 'S1.M.A.1',
    problem: 'A market trader buys 3 oranges at shs. 500 each and sells all for shs. 2,000. Find the profit.',
    solution_steps: [
      { step_number: 1, text: 'Cost price = 3 × shs. 500 = shs. 1,500', mark: 'M1', explanation: 'Correct multiplication of unit cost' },
      { step_number: 2, text: 'Selling price = shs. 2,000', mark: 'B1', explanation: 'Given' },
      { step_number: 3, text: 'Profit = SP − CP = 2,000 − 1,500 = shs. 500', mark: 'A1', explanation: 'Correct subtraction' },
    ],
    final_answer: 'Profit = shs. 500',
  },
  {
    id: 'we-2',
    code: 'S1.M.A.1',
    problem: 'Solve for x: 3x + 5 = 2x + 12',
    solution_steps: [
      { step_number: 1, text: 'Collect like terms: 3x − 2x = 12 − 5', mark: 'M1' },
      { step_number: 2, text: 'x = 7', mark: 'A1' },
    ],
    final_answer: 'x = 7',
  },
];

export const mockLocalProblems: LocalProblem[] = [
  {
    id: 'lp-1',
    code: 'S1.M.A.1',
    difficulty: 'easy',
    context: 'A bodaboda rider charges shs. 1,000 per trip. If he makes 8 trips, how much does he earn?',
    problem: 'Calculate the total earnings for 8 trips at shs. 1,000 each.',
    answer: 'shs. 8,000',
    context_tags: ['Bodaboda', 'Market prices'],
  },
  {
    id: 'lp-2',
    code: 'S2.M.N.1',
    difficulty: 'easy',
    context: 'A school has 120 pupils in S1 and 180 in S2. The headteacher wants equal class sizes.',
    problem: 'Find the HCF of 120 and 180 to determine the largest possible class size.',
    answer: '60',
    context_tags: ['School'],
  },
];

export const mockUNEBFormat: UNEBFormat = {
  exam: 'UCE',
  paper_count: 2,
  total_marks: 100,
  duration_minutes: 180,
  sections: [
    { name: 'Section A', marks: 40, question_count: 20, description: 'Short answer questions' },
    { name: 'Section B', marks: 60, question_count: 6, description: 'Structured questions' },
  ],
};

export const mockDocuments: DocumentItem[] = [
  { id: 'doc-1', title: 'S1 Algebra Textbook', document_type: 'textbook', file_url: '', page_count: 120, processing_status: 'ready', created_at: '2026-09-28T10:00:00Z', updated_at: '2026-09-28T10:05:00Z' },
  { id: 'doc-2', title: 'UCE Past Paper 2024', document_type: 'past_paper', file_url: '', page_count: 12, processing_status: 'processing', created_at: '2026-09-29T14:00:00Z', updated_at: '2026-09-29T14:01:00Z' },
  { id: 'doc-3', title: 'Trigonometry Notes', document_type: 'notes', file_url: '', page_count: 8, processing_status: 'ready', created_at: '2026-09-27T09:00:00Z', updated_at: '2026-09-27T09:03:00Z' },
  { id: 'doc-4', title: 'Calculus Worksheet', document_type: 'worksheet', file_url: '', page_count: 4, processing_status: 'failed', created_at: '2026-09-26T16:00:00Z', updated_at: '2026-09-26T16:02:00Z' },
  { id: 'doc-5', title: 'Number Theory Notes', document_type: 'notes', file_url: '', page_count: 15, processing_status: 'pending', created_at: '2026-09-30T08:00:00Z', updated_at: '2026-09-30T08:00:00Z' },
];

export const mockScanJobs: ScanJob[] = Array.from({ length: 10 }).map((_, i) => ({
  id: `scan-${i + 1}`,
  status: 'completed',
  image_url: '',
  problem_text: ['Solve 2x + 5 = 13', 'Find HCF of 24 and 36', 'Simplify 3(x + 2) − 5', 'Find the area of a circle r=7', 'Solve x² − 4 = 0'][i % 5],
  solution: 'Step-by-step solution provided.',
  solution_steps: [
    { step_number: 1, text: 'Isolate the variable term', mark: 'M1' as const },
    { step_number: 2, text: 'Solve for x', mark: 'A1' as const },
  ],
  final_answer: 'x = 4',
  confidence: 0.85 + (i * 0.01),
  topic_code: 'S1.M.A.1',
  topic_name: 'Linear Equations',
  textbook_ref: 'MK S1 Maths Book 1, Ch. 3',
  context_tags: ['Market prices', 'Bodaboda', 'School'][i % 1] ? ['Market prices'] : ['School'],
  created_at: `2026-09-${30 - i}T12:00:00Z`,
}));

export const mockPastPaper: PastPaper = {
  id: 'pp-1',
  title: 'UCE Mathematics 2024',
  year: 2024,
  subject: 'Mathematics',
  difficulty: 'medium',
  file_url: '',
  processing_status: 'ready',
  question_count: 6,
  created_at: '2026-09-28T10:00:00Z',
};

export const mockExtractedQuestions: ExtractedQuestion[] = [
  { id: 'eq-1', question_number: 1, text: 'Solve the equation 2x + 5 = 13', marks: 5, answer: 'x = 4', topic_code: 'S1.M.A.1' },
  { id: 'eq-2', question_number: 2, text: 'Find the HCF of 24 and 36 using prime factorisation.', marks: 5, answer: '12', topic_code: 'S2.M.N.1' },
  { id: 'eq-3', question_number: 3, text: 'A trader buys 3 oranges at shs. 500 each and sells all for shs. 2,000. Find the profit.', marks: 6, answer: 'shs. 500', topic_code: 'S1.M.A.1' },
];
