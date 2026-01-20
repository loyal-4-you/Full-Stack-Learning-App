
import { Component, ChangeDetectionStrategy, input, effect, ElementRef, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

function simpleMarkdownParser(markdown: string): string {
  if (!markdown) {
    return '';
  }
  const escapeHtml = (unsafe: string) =>
    unsafe.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");

  let processed = markdown;
  const codeBlocks: string[] = [];

  // 1. Extract and replace code blocks with placeholders
  processed = processed.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
    const placeholder = `{{CODE_BLOCK_${codeBlocks.length}}}`;
    const language = lang || 'plaintext';
    const escapedCode = escapeHtml(code.trim());
    codeBlocks.push(`<pre><code class="language-${language}">${escapedCode}</code></pre>`);
    return placeholder;
  });

  // 2. Process remaining markdown line by line
  const lines = processed.split('\n');
  let html = '';
  let inList = false;
  let listType = '';

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Skip empty lines
    if (!line.trim() && !inList) {
      if (html && !html.endsWith('</p>') && !html.endsWith('</h3>') && !html.endsWith('</h2>') && !html.endsWith('</h1>')) {
        html += '<br>';
      }
      continue;
    }

    // Handle code block placeholders
    if (line.trim().startsWith('{{CODE_BLOCK_')) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      html += line.trim();
      continue;
    }

    // Handle headings
    if (line.startsWith('### ')) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      html += `<h3>${line.substring(4)}</h3>`;
      continue;
    }
    if (line.startsWith('## ')) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      html += `<h2>${line.substring(3)}</h2>`;
      continue;
    }
    if (line.startsWith('# ')) {
      if (inList) {
        html += listType === 'ul' ? '</ul>' : '</ol>';
        inList = false;
      }
      html += `<h1>${line.substring(2)}</h1>`;
      continue;
    }

    // Handle unordered lists
    if (line.trim().match(/^[-*]\s+/)) {
      if (!inList) {
        html += '<ul>';
        inList = true;
        listType = 'ul';
      } else if (listType !== 'ul') {
        html += '</ol><ul>';
        listType = 'ul';
      }
      const content = line.trim().substring(2);
      html += `<li>${processInlineFormatting(content)}</li>`;
      continue;
    }

    // Handle ordered lists
    if (line.trim().match(/^\d+\.\s+/)) {
      if (!inList) {
        html += '<ol>';
        inList = true;
        listType = 'ol';
      } else if (listType !== 'ol') {
        html += '</ul><ol>';
        listType = 'ol';
      }
      const content = line.trim().replace(/^\d+\.\s+/, '');
      html += `<li>${processInlineFormatting(content)}</li>`;
      continue;
    }

    // Close list if we're in one and hit regular text
    if (inList && line.trim() && !line.trim().match(/^[-*\d]/)) {
      html += listType === 'ul' ? '</ul>' : '</ol>';
      inList = false;
    }

    // Handle paragraphs
    if (line.trim()) {
      html += `<p>${processInlineFormatting(line)}</p>`;
    }
  }

  // Close any open lists
  if (inList) {
    html += listType === 'ul' ? '</ul>' : '</ol>';
  }

  // 3. Restore code blocks
  html = html.replace(/{{CODE_BLOCK_(\d+)}}/g, (match, index) => {
    return codeBlocks[parseInt(index, 10)];
  });

  return html;
}

function processInlineFormatting(text: string): string {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  // Links
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  return text;
}


@Component({
  selector: 'app-markdown',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
      color: #d1d5db; /* text-gray-300 */
      line-height: 1.75;
      font-size: 1rem;
      max-width: 100%;
      overflow-wrap: break-word;
      word-wrap: break-word;
    }
    :host h1 {
      font-size: 1.875rem; /* text-3xl */
      font-weight: 800;
      color: #67e8f9; /* text-cyan-300 */
      margin-top: 3rem;
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #475569;
      overflow-wrap: break-word;
    }
    :host h1:first-child {
      margin-top: 0;
    }
    :host h2 {
      font-size: 1.5rem; /* text-2xl */
      font-weight: 700;
      color: #5eead4; /* text-teal-300 */
      margin-top: 2.5rem;
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #475569;
      overflow-wrap: break-word;
    }
    :host h2:first-child {
      margin-top: 0;
    }
    :host h3 {
      font-size: 1.375rem; /* text-xl */
      font-weight: 700;
      color: #a5f3fc; /* text-cyan-200 */
      margin-top: 2rem;
      margin-bottom: 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #475569;
      overflow-wrap: break-word;
    }
    :host h3:first-child {
      margin-top: 0;
    }
    :host p {
      margin-bottom: 1.25rem;
      line-height: 1.8;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    :host p:last-child {
      margin-bottom: 0;
    }
    :host strong {
      color: #f8fafc; /* text-slate-50 */
      font-weight: 600;
    }
    :host em {
      color: #e2e8f0; /* text-slate-200 */
      font-style: italic;
    }
    :host ul, :host ol {
      margin-left: 1.5rem;
      margin-bottom: 1.25rem;
      padding-left: 0.5rem;
      max-width: 100%;
    }
    :host ul {
      list-style-type: disc;
    }
    :host ol {
      list-style-type: decimal;
    }
    :host li {
      margin-bottom: 0.5rem;
      color: #d1d5db;
      line-height: 1.75;
      overflow-wrap: break-word;
      word-break: break-word;
    }
    :host li::marker {
      color: #60a5fa; /* text-blue-400 */
    }
    :host a {
      color: #60a5fa; /* text-blue-400 */
      text-decoration: underline;
      text-decoration-color: rgba(96, 165, 250, 0.4);
      text-underline-offset: 2px;
      transition: all 0.2s ease;
      overflow-wrap: break-word;
      word-break: break-all;
    }
    :host a:hover {
      color: #93c5fd; /* text-blue-300 */
      text-decoration-color: rgba(147, 197, 253, 0.6);
    }
    :host code.inline-code {
      background-color: #1e293b; /* slate-800 */
      color: #fbbf24; /* amber-400 */
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.875rem;
      border: 1px solid #334155;
      word-break: break-all;
      white-space: pre-wrap;
    }
    :host pre {
      background-color: #0f172a; /* slate-900 */
      color: #cbd5e1; /* slate-300 */
      padding: 1.25rem;
      border-radius: 0.5rem;
      overflow-x: auto;
      overflow-y: hidden;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      font-size: 0.9rem;
      line-height: 1.6;
      border: 1px solid #334155;
      margin-top: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
      max-width: 100%;
      -webkit-overflow-scrolling: touch;
    }
    :host pre::-webkit-scrollbar {
      height: 8px;
    }
    :host pre::-webkit-scrollbar-track {
      background: #1e293b;
      border-radius: 4px;
    }
    :host pre::-webkit-scrollbar-thumb {
      background: #475569;
      border-radius: 4px;
    }
    :host pre::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    :host code {
      font-family: inherit;
      max-width: 100%;
    }
  `]
})
export class MarkdownModule {
  content = input.required<string>();

  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  constructor() {
    effect(() => {
      const parsedHtml = simpleMarkdownParser(this.content());
      this.renderer.setProperty(this.elementRef.nativeElement, 'innerHTML', parsedHtml);
    });
  }
}
