import { USE_MOCK_DATA, apiUpload, get, post } from './api';
import { mockFetchLevels, mockFetchLevel, mockFetchObjective, mockFetchStrand, mockFetchWorkedExamples, mockFetchLocalProblems, mockFetchUNEBFormat, mockFetchTextbooks, mockSearchObjectives } from '../mocks/curriculum';

const live = (fallback, fn) => USE_MOCK_DATA ? fallback() : fn();
export const fetchLevels = () => live(mockFetchLevels, () => get('/api/curriculum/levels/'));
export const fetchLevel = (level) => USE_MOCK_DATA ? mockFetchLevel(level) : get(`/api/curriculum/levels/${level}/`);
export const fetchObjective = (code) => USE_MOCK_DATA ? mockFetchObjective(code) : get(`/api/curriculum/objectives/${code}/`);
export const fetchStrand = (level, code) => USE_MOCK_DATA ? mockFetchStrand(level, code) : get(`/api/curriculum/strands/${level}/${code}/`);
export const fetchWorkedExamples = (code) => USE_MOCK_DATA ? mockFetchWorkedExamples(code) : get(`/api/curriculum/worked-examples/?code=${encodeURIComponent(code)}`);
export const fetchLocalProblems = (code, difficulty) => USE_MOCK_DATA ? mockFetchLocalProblems(code, difficulty) : get(`/api/curriculum/local-problems/?code=${encodeURIComponent(code)}${difficulty ? `&difficulty=${difficulty}` : ''}`);
export const fetchUNEBFormat = (exam = 'UCE') => USE_MOCK_DATA ? mockFetchUNEBFormat(exam) : get(`/api/curriculum/uneb-format/?exam=${exam}`);
export const fetchTextbooks = (level) => USE_MOCK_DATA ? mockFetchTextbooks(level) : get(`/api/curriculum/textbooks/?level=${level}`);
export const searchObjectives = (query) => USE_MOCK_DATA ? mockSearchObjectives(query) : get(`/api/curriculum/search/?q=${encodeURIComponent(query)}`);

// Past paper -> quiz generator (teacher/admin only). Note the URL prefix
// here is /api/teacher/past-papers/, not /api/curriculum/ like everything
// above — that's where these endpoints actually live on the backend.
export function uploadPastPaper(file, metadata = {}, onProgress) {
  const form = new FormData();
  form.append('file', { uri: file.uri, name: file.name || 'paper.pdf', type: file.mimeType || 'application/pdf' });
  form.append('title', metadata.title || file.name);
  form.append('document_type', 'past_paper');
  return apiUpload.upload('/api/teacher/past-papers/', form, { onProgress });
}

export const fetchPastPaper = (id) => get(`/api/teacher/past-papers/${id}/`);

export const extractPastPaperQuestions = (id) => get(`/api/teacher/past-papers/${id}/extract-quiz/`);

export const savePastPaperAsQuiz = (id, { lessonId, questions, title }) =>
  post(`/api/teacher/past-papers/${id}/save-as-quiz/`, { lesson_id: lessonId, questions, title });