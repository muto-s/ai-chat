'use client';

/**
 * Markdownレンダラーコンポーネント
 */

import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <ReactMarkdown
        components={{
        // コードブロック
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || '');
          const isInline = !match;

          if (isInline) {
            return (
              <code
                className="rounded bg-gray-100 px-1.5 py-0.5 text-sm dark:bg-gray-800"
                {...props}
              >
                {children}
              </code>
            );
          }

          return (
            <code
              className={`block rounded-lg bg-gray-100 p-4 text-sm dark:bg-gray-800 ${className}`}
              {...props}
            >
              {children}
            </code>
          );
        },
        // リンク
        a: ({ node, children, ...props }) => (
          <a
            className="text-blue-600 hover:underline dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          >
            {children}
          </a>
        ),
        // リスト
        ul: ({ node, children, ...props }) => (
          <ul className="list-disc space-y-1 pl-6" {...props}>
            {children}
          </ul>
        ),
        ol: ({ node, children, ...props }) => (
          <ol className="list-decimal space-y-1 pl-6" {...props}>
            {children}
          </ol>
        ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
