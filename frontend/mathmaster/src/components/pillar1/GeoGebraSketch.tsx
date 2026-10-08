import * as React from 'react';
import { Box, RotateCw, Maximize2, Minimize2 } from 'lucide-react';
import type { GeoGebraPayload } from '@/types/learning';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    GGBApplet?: new (parameters: Record<string, unknown>, autoInject: boolean) => {
      inject: (element: HTMLElement) => void;
    };
  }
}

interface GeoGebraSketchProps {
  payload: GeoGebraPayload;
  height?: number;
  className?: string;
}

const GEOGEBRA_SCRIPT_SRC = 'https://www.geogebra.org/apps/deployggb.js';
const GEOGEBRA_LOAD_TIMEOUT_MS = 8000;

export function GeoGebraSketch({ payload, height = 420, className }: GeoGebraSketchProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [loadState, setLoadState] = React.useState<'loading' | 'ready' | 'failed'>('loading');
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const loadTimeoutRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    function init() {
      if (!containerRef.current || !window.GGBApplet) { setLoadState('failed'); return; }
      const params: Record<string, unknown> = {
        appName: payload.view === '3D' ? '3d' : 'classic',
        width: containerRef.current.clientWidth || 800,
        height: isFullscreen ? window.innerHeight - 120 : height,
        showToolBar: true,
        showAlgebraInput: true,
        showMenuBar: false,
        enableRightClick: true,
        enableLabelDrags: true,
        preventFocus: true,
        appletOnLoad(api: any) {
          if (cancelled) return;
          // Each step is isolated: one unsupported call must not turn a loaded applet into "Sketch unavailable".
          const safe = (fn: () => void) => { try { fn(); } catch (err) { console.warn('GeoGebra config skipped:', err); } };
          try {
            if (payload.view === '2D') {
              if (payload.axes === false) safe(() => api.setAxesVisible(false, false));
              if (payload.grid === false) safe(() => api.setGridVisible(false));
              const { x_min, x_max, y_min, y_max } = payload;
              if (typeof x_min === 'number' && typeof x_max === 'number' &&
                  typeof y_min === 'number' && typeof y_max === 'number') {
                safe(() => api.setCoordSystem(x_min, x_max, y_min, y_max));
              }
              if (payload.x_label || payload.y_label) safe(() => api.setAxisLabels(1, payload.x_label || 'x', payload.y_label || 'y'));
            } else if (payload.view === '3D') {
              safe(() => api.setAxisLabels(-1, payload.x_label || 'x', payload.y_label || 'y', payload.z_label || 'z'));
            }
            for (const cmd of payload.commands || []) {
              try { api.evalCommand(cmd); } catch (err) { console.warn('GeoGebra command failed:', cmd, err); }
            }
            setLoadState('ready');
          } catch (err) { console.error('GeoGebra init error:', err); setLoadState('failed'); }
        },
      };
      try {
        containerRef.current.innerHTML = '';
        const applet = new window.GGBApplet(params, true);
        applet.inject(containerRef.current);
      } catch (err) { console.error('GeoGebra inject failed:', err); setLoadState('failed'); }
    }

    if (window.GGBApplet) { init(); }
    else {
      const existing = document.querySelector(`script[src="${GEOGEBRA_SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener('load', init);
        existing.addEventListener('error', () => setLoadState('failed'));
      } else {
        const script = document.createElement('script');
        script.src = GEOGEBRA_SCRIPT_SRC;
        script.async = true;
        script.onload = init;
        script.onerror = () => setLoadState('failed');
        document.head.appendChild(script);
      }
    }

    loadTimeoutRef.current = window.setTimeout(() => {
      if (loadState === 'loading') setLoadState('failed');
    }, GEOGEBRA_LOAD_TIMEOUT_MS);

    return () => {
      cancelled = true;
      if (loadTimeoutRef.current) window.clearTimeout(loadTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, height, isFullscreen]);

  return (
    <div className={cn(
      'my-3 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-soft dark:border-ink-700 dark:bg-ink-800',
      isFullscreen && 'fixed inset-0 z-50 m-0 rounded-none',
      className,
    )}>
      <div className="flex items-center justify-between border-b border-ink-200 bg-ink-50 px-4 py-2.5 dark:border-ink-700 dark:bg-ink-900">
        <div className="flex items-center gap-2">
          <Box className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-ink-900 dark:text-ink-100">
            {payload.title || (payload.view === '3D' ? '3D Sketch' : 'Sketch')}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'rounded-md px-2 py-0.5 text-[10px] font-bold text-white',
            payload.view === '3D' ? 'bg-accent-500' : 'bg-brand-500',
          )}>{payload.view}</span>
          <button
            onClick={() => setIsFullscreen((v) => !v)}
            className="rounded-md p-1 text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-700 dark:hover:bg-ink-700"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
      <div className="relative bg-white dark:bg-ink-800" style={{ height: isFullscreen ? 'calc(100vh - 120px)' : height }}>
        <div ref={containerRef} className="h-full w-full" />
        {loadState === 'loading' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 backdrop-blur-sm dark:bg-ink-800/80">
            <RotateCw className="h-6 w-6 animate-spin text-brand-500" />
            <p className="text-xs text-ink-500">Building {payload.view} workspace…</p>
          </div>
        )}
        {loadState === 'failed' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-rose-50/90 p-4 text-center dark:bg-rose-500/10">
            <Box className="h-6 w-6 text-rose-500" />
            <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Sketch unavailable</p>
            <p className="text-xs text-rose-600 dark:text-rose-400">GeoGebra failed to load. Check your connection or try again.</p>
          </div>
        )}
      </div>
      {payload.view === '3D' && (
        <p className="border-t border-ink-200 bg-ink-50 px-4 py-1.5 text-xs text-ink-500 dark:border-ink-700 dark:bg-ink-900">
          💡 Drag to rotate. Scroll to zoom. Right-click for more options.
        </p>
      )}
    </div>
  );
}