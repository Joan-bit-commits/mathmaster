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
      block.className = 'relative my-5 overflow-x-auto rounded-2xl border border-brand-100 bg-brand-50 p-5 font-mono text-sm leading-6 text-brand-900 dark:border-brand-900/50 dark:bg-brand-900/20 dark:text-brand-100';
      const button = document.createElement('button');
      button.className = 'absolute right-3 top-3 rounded-lg bg-white/80 p-2 text-brand-600 shadow-sm hover:bg-white dark:bg-ink-800/80 dark:text-brand-300';
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
