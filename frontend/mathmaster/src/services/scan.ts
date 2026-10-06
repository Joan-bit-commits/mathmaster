import { get, uploadFile } from '@/lib/api';
import type { ScanJob } from '@/types/pillar1';

export function submitScan(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<ScanJob> {
  return uploadFile('/api/scan/solve/', file, {}, onProgress, 'image') as Promise<ScanJob>;
}

export function fetchScanHistory(page = 1): Promise<{ count: number; next: string | null; previous: string | null; results: ScanJob[] }> {
  return get('/api/scan/history/', { params: { page } });
}

export function fetchScanJob(id: string): Promise<ScanJob> {
  return get<ScanJob>(`/api/scan/jobs/${id}/`);
}
