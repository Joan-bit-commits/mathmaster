import { Camera } from 'lucide-react';
import { useAuthedBlobUrl } from '@/hooks/useAuthedBlobUrl';
import { cn } from '@/lib/utils';

/** Authenticated preview of a scanned photo. `width` asks the server for a downscaled JPEG (thumbnails). */
export function ScanImage({
  scanId,
  width,
  alt = 'Scanned problem',
  className,
}: {
  scanId: string | number;
  width?: number;
  alt?: string;
  className?: string;
}) {
  const { url, loading } = useAuthedBlobUrl(`/api/scan/jobs/${scanId}/image/${width ? `?w=${width}` : ''}`);
  if (url) return <img src={url} alt={alt} loading="lazy" className={cn('h-full w-full object-cover', className)} />;
  return (
    <div className={cn('flex h-full w-full items-center justify-center', loading && 'animate-pulse')}>
      <Camera className="h-8 w-8 text-ink-300" />
    </div>
  );
}
