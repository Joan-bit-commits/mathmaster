import * as React from 'react';
import { api } from '@/lib/api';

/**
 * Fetches a protected API file (PDF / image) with the auth + school headers the
 * shared axios instance already attaches, and exposes it as an object URL that
 * <iframe>/<img> can load. The URL is revoked automatically on change/unmount.
 */
export function useAuthedBlobUrl(path: string | null | undefined) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(!!path);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!path) {
      setUrl(null);
      setLoading(false);
      setError(false);
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    setLoading(true);
    setError(false);
    setUrl(null);
    api
      .get(path, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data as Blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return { url, loading, error };
}
