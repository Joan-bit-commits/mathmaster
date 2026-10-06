import { USE_MOCK_DATA, apiUpload, get } from './api';
import { mockSubmitScan, mockScanHistory } from '../mocks/scan';
export const submitScan = (imageUri, onProgress) => { const form = new FormData(); form.append('image', { uri: imageUri, name: 'math-problem.jpg', type: 'image/jpeg' }); return USE_MOCK_DATA ? mockSubmitScan() : apiUpload.upload('/api/scan/solve/', form, { onProgress }); };
export const fetchScanHistory = async (params = {}) => {
	if (USE_MOCK_DATA) return mockScanHistory;
	const data = await get(`/api/scan/history/${params.page ? `?page=${params.page}` : ''}`);
	return data.results ?? data;
};
export const fetchScanJob = (id) => USE_MOCK_DATA ? Promise.resolve(mockScanHistory.find((scan) => String(scan.id) === String(id)) || mockScanHistory[0]) : get(`/api/scan/jobs/${id}/`);

export async function pollScanUntilProcessed(id, { intervalMs = 1500, timeoutMs = 180000 } = {}) {
	const startedAt = Date.now();
	for (;;) {
		const scan = await fetchScanJob(id);
		if (scan.status === 'ready' || scan.status === 'failed') return scan;
		if (Date.now() - startedAt > timeoutMs) return scan;
		await new Promise((resolve) => setTimeout(resolve, intervalMs));
	}
}