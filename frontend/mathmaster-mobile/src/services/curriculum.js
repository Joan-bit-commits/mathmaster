import { USE_MOCK_DATA, get } from './api';
import { mockFetchLevels, mockFetchLevel, mockFetchObjective, mockFetchStrand, mockFetchWorkedExamples, mockFetchLocalProblems, mockFetchUNEBFormat, mockFetchTextbooks, mockSearchObjectives } from '../mocks/curriculum';

const live = (fallback, fn) => USE_MOCK_DATA ? fallback() : fn();
// GET /api/curriculum/levels/
export const fetchLevels = () => live(mockFetchLevels, () => get('/api/curriculum/levels/'));
// GET /api/curriculum/levels/{level}/
export const fetchLevel = (level) => USE_MOCK_DATA ? mockFetchLevel(level) : get(`/api/curriculum/levels/${level}/`);
// GET /api/curriculum/objectives/{code}/
export const fetchObjective = (code) => USE_MOCK_DATA ? mockFetchObjective(code) : get(`/api/curriculum/objectives/${code}/`);
// GET /api/curriculum/strands/{level}/{code}/
export const fetchStrand = (level, code) => USE_MOCK_DATA ? mockFetchStrand(level, code) : get(`/api/curriculum/strands/${level}/${code}/`);
// GET /api/curriculum/worked-examples/?code={code}
export const fetchWorkedExamples = (code) => USE_MOCK_DATA ? mockFetchWorkedExamples(code) : get(`/api/curriculum/worked-examples/?code=${encodeURIComponent(code)}`);
// GET /api/curriculum/local-problems/?code={code}&difficulty={difficulty}
export const fetchLocalProblems = (code, difficulty) => USE_MOCK_DATA ? mockFetchLocalProblems(code, difficulty) : get(`/api/curriculum/local-problems/?code=${encodeURIComponent(code)}${difficulty ? `&difficulty=${difficulty}` : ''}`);
// GET /api/curriculum/uneb-format/?exam={exam}
export const fetchUNEBFormat = (exam = 'UCE') => USE_MOCK_DATA ? mockFetchUNEBFormat(exam) : get(`/api/curriculum/uneb-format/?exam=${exam}`);
// GET /api/curriculum/textbooks/?level={level}
export const fetchTextbooks = (level) => USE_MOCK_DATA ? mockFetchTextbooks(level) : get(`/api/curriculum/textbooks/?level=${level}`);
// GET /api/curriculum/search/?q={query}
export const searchObjectives = (query) => USE_MOCK_DATA ? mockSearchObjectives(query) : get(`/api/curriculum/search/?q=${encodeURIComponent(query)}`);