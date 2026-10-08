import DOMPurify from 'dompurify';
import { marked } from 'marked';
import * as React from 'react';
import renderMathInElement from 'katex/contrib/auto-render';
import { cn } from '@/lib/utils';

export function MarkdownRenderer({ content, className }: { content: string; className?: string }) {
  const [copied, setCopied] = React.useState<string | null>(null);
  const html = React.useMemo(() => DOMPurify.sanitize(marked.parse(content, { async: false }) as string), [content]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const copyCode = async (code: string, id: string) => { await navigator.clipboard.writeText(code); setCopied(id); window.setTimeout(() => setCopied(null), 1600); };
  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const blocks = Array.from(container.querySelectorAll('pre'));
    blocks.forEach((block, index) => {
      const code = block.querySelector('code')?.textContent ?? block.textContent ?? '';
      const id = `code-${index}`;
      block.className = 'relative my-4 overflow-x-auto rounded-xl border border-ink-200 bg-ink-50 p-4 pr-12 font-mono text-sm leading-6 text-ink-800 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100';
      const button = document.createElement('button');
      button.className = 'absolute right-2 top-2 rounded-lg border border-ink-200 bg-white px-2 py-1 text-xs text-ink-500 hover:text-ink-900 dark:border-ink-700 dark:bg-ink-800 dark:text-ink-300';
      button.setAttribute('aria-label', 'Copy code');
      button.innerHTML = copied === id ? '✓' : '⧉';
      button.onclick = () => { void copyCode(code, id); };
      block.appendChild(button);
    });
    renderMathInElement(container, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
      ],
      throwOnError: false,
    });
  }, [html, copied]);
  return <div ref={containerRef} className={cn('prose prose-slate max-w-none dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-brand-600 prose-strong:text-ink-900 dark:prose-strong:text-ink-100', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
