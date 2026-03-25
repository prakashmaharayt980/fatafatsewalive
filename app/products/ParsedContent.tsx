import React, { type JSX, useMemo } from 'react';
import parse, { domToReact, type HTMLReactParserOptions, type Element, type DOMNode, type Text } from 'html-react-parser';
import { sanitizeHtml } from '@/lib/dompurify';

interface ParsedContentProps {
  description: string;
  className?: string;
}

const isElement = (node: DOMNode): node is Element => node.type === 'tag';
const isText = (node: DOMNode): node is Text => node.type === 'text';

const isQuillUiSpan = (node: DOMNode): boolean =>
  isElement(node) && (node as Element).name === 'span' && (node as Element).attribs?.class === 'ql-ui';

const isEmptyQuillParagraph = (node: Element): boolean => {
  const kids = node.children as DOMNode[];
  return (
    kids.length === 0 ||
    (kids.length === 1 && isElement(kids[0]) && (kids[0] as Element).name === 'br') ||
    (kids.length === 1 && isText(kids[0]) && !(kids[0] as Text).data?.trim())
  );
};

export default function ParsedContent({ description, className = '' }: ParsedContentProps) {
  const parsedContent = useMemo(() => {
    if (!description) {
      return (
        <p className="text-gray-400 italic text-sm">No description available.</p>
      );
    }

    const cleanHTML = sanitizeHtml(description, {
      ADD_TAGS: ['iframe'],
      ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'src', 'style', 'width', 'height', 'loading'],
    });

    const options: HTMLReactParserOptions = {
      replace: (domNode: DOMNode) => {
        if (!isElement(domNode)) return undefined;
        const { name, attribs, children } = domNode as Element;
        const nodeChildren = (children as DOMNode[]).filter(n => !isQuillUiSpan(n));

        // ── QUILL FLAT LIST ITEMS (data-list) ────────────────────────────────
        if (attribs?.['data-list']) {
          const indent = parseInt(attribs?.['data-indent'] || '0', 10);
          return (
            <li
              style={{ paddingLeft: indent > 0 ? `${indent * 1.5}rem` : undefined }}
              className="text-gray-700 text-sm md:text-[15px] leading-relaxed py-1"
            >
              {domToReact(nodeChildren, options)}
            </li>
          );
        }

        // ── OL ────────────────────────────────────────────────────────────────
        if (name === 'ol') {
          const firstLi = nodeChildren.find(isElement);
          const isBullet = firstLi?.attribs?.['data-list'] === 'bullet';
          if (isBullet) {
            return (
              <ul className="list-disc list-outside pl-5 my-3 space-y-1.5 text-gray-700 text-sm md:text-[15px] leading-relaxed marker:text-(--colour-fsP1,#f86014)">
                {domToReact(nodeChildren, options)}
              </ul>
            );
          }
          return (
            <ol className="list-decimal list-outside pl-5 my-3 space-y-1.5 text-gray-700 text-sm md:text-[15px] leading-relaxed marker:text-(--colour-fsP2,#1967b3) marker:font-medium">
              {domToReact(nodeChildren, options)}
            </ol>
          );
        }

        // ── UL ────────────────────────────────────────────────────────────────
        if (name === 'ul') {
          return (
            <ul className="list-disc list-outside pl-5 my-3 space-y-1.5 text-gray-700 text-sm md:text-[15px] leading-relaxed marker:text-(--colour-fsP1,#f86014)">
              {domToReact(nodeChildren, options)}
            </ul>
          );
        }

        // ── LI (plain, non-data-list) ─────────────────────────────────────────
        if (name === 'li' && !attribs?.['data-list']) {
          return (
            <li className="text-gray-700 text-sm md:text-[15px] leading-relaxed py-1">
              {domToReact(nodeChildren, options)}
            </li>
          );
        }

        // ── TABLE ─────────────────────────────────────────────────────────────
        if (attribs?.class === 'quill-better-table-wrapper') {
          const tableNode = nodeChildren.find(isElement);
          if (!tableNode) return null;
          const tableChildren = tableNode.children as DOMNode[];
          const thead = tableChildren.find(n => isElement(n) && n.name === 'thead') as Element;
          const tbody = tableChildren.find(n => isElement(n) && n.name === 'tbody') as Element;

          return (
            <div className="w-full overflow-x-auto my-2 rounded-md border border-gray-200 scrollbar-hide">
              <table className="w-full min-w-[400px] border-collapse text-sm text-left">
                {thead && (
                  <thead className="bg-[var(--colour-fsP2)] text-white">
                    {(thead.children as DOMNode[]).filter(isElement).map((tr, i) => (
                      <tr key={i}>
                        {(tr.children as DOMNode[]).filter(isElement).map((cell, j) => (
                          <th key={j} className="px-2 py-1.5 font-medium border-r border-white/10 last:border-r-0 whitespace-nowrap">
                            {domToReact(cell.children as DOMNode[], options)}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                )}
                <tbody className="divide-y divide-gray-100 bg-white">
                  {tbody && (tbody.children as DOMNode[]).filter(isElement).map((tr, i) => (
                    <tr key={i} className="hover:bg-gray-50/80 transition-colors duration-150 group">
                      {(tr.children as DOMNode[]).filter(isElement).map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 text-gray-700 border-r border-gray-100 last:border-r-0 align-top group-hover:text-gray-900 leading-relaxed">
                          {domToReact(cell.children as DOMNode[], options)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        // ── IMAGE ─────────────────────────────────────────────────────────────
        if (name === 'img') {
          const { src = '', alt = 'Content image', width, height, loading, style, ...restAttribs } = attribs;
          const baseUrl = 'https://fatafatsewa.com/';
          const absoluteUrl =
            src.startsWith('http') || src.startsWith('data:') ? src : `${baseUrl}${src}`;
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <span className="block my-3 rounded-lg overflow-hidden">
              <img
                src={absoluteUrl}
                alt={alt}
                loading="lazy"
                className="w-full h-auto object-contain max-h-[480px]"
              />
            </span>
          );
        }

        // ── IFRAME ────────────────────────────────────────────────────────────
        if (name === 'iframe') {
          const { style, class: className, ...restAttribs } = attribs || {};
          return (
            <span className="block w-full my-4 rounded-lg overflow-hidden aspect-video">
              <iframe {...restAttribs} className="w-full h-full" style={{ minHeight: '300px' }} />
            </span>
          );
        }

        // ── BLOCKQUOTE ────────────────────────────────────────────────────────
        if (name === 'blockquote') {
          return (
            <blockquote className="border-l-4 border-(--colour-fsP1,#f86014) bg-orange-50/50 pl-4 pr-3 py-3 my-4 rounded-r-lg text-gray-700 italic text-sm md:text-[15px] leading-relaxed">
              {domToReact(nodeChildren, options)}
            </blockquote>
          );
        }

        // ── PRE / CODE ────────────────────────────────────────────────────────
        if (name === 'pre') {
          return (
            <pre className="bg-gray-900 text-gray-200 rounded-lg px-4 py-3 my-4 overflow-x-auto text-sm font-mono leading-relaxed shadow-inner scrollbar-hide">
              {domToReact(nodeChildren, options)}
            </pre>
          );
        }
        if (name === 'code') {
          return (
            <code className="bg-gray-100 text-(--colour-fsP1,#f86014) rounded px-1.5 py-0.5 text-[0.85em] font-mono border border-gray-200">
              {domToReact(nodeChildren, options)}
            </code>
          );
        }

        // ── ANCHOR ────────────────────────────────────────────────────────────
        if (name === 'a') {
          const { style, class: className, target, rel, ...restAttribs } = attribs || {};
          return (
            <a
              {...restAttribs}
              className="text-(--colour-fsP2,#1967b3) underline underline-offset-4 decoration-[1.5px] decoration-(--colour-fsP2,#1967b3)/30 hover:decoration-(--colour-fsP2,#1967b3) hover:text-blue-800 transition-all duration-200 font-medium"
              target={target || '_blank'}
              rel="noopener noreferrer"
            >
              {domToReact(nodeChildren, options)}
            </a>
          );
        }

        // ── PARAGRAPH ─────────────────────────────────────────────────────────
        if (name === 'p') {
          if (isEmptyQuillParagraph(domNode)) {
            return <span className="block h-1.5" />;
          }
          return (
            <p className="text-gray-700 text-sm md:text-[15px] leading-relaxed my-2">
              {domToReact(nodeChildren, options)}
            </p>
          );
        }

        // ── HEADINGS ──────────────────────────────────────────────────────────
        if (/^h[1-6]$/.test(name)) {
          if (name === 'h1') return null;

          const headingStyles: Record<string, string> = {
            h2: 'text-xl md:text-2xl font-bold text-(--colour-fsP2,#1967b3) mt-2 mb-2 pb-2 border-b border-gray-100 leading-snug',
            h3: 'text-lg md:text-xl font-semibold text-gray-800 mt-2 mb-1 leading-snug',
            h4: 'text-base md:text-lg font-semibold text-gray-800 mt-2 mb-2 leading-snug',
            h5: 'text-sm md:text-base font-semibold text-gray-700 mt-2 mb-2',
            h6: 'text-sm font-semibold text-gray-500 mt-2 mb-1 uppercase tracking-wider',
          };
          const Tag = name as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

          return React.createElement(
            Tag,
            { className: `${headingStyles[name] || 'font-bold text-gray-900'} ${className}`.trim() },
            domToReact(nodeChildren, options)
          );
        }

        // ── INLINE FORMATTING ─────────────────────────────────────────────────
        if (name === 'strong' || name === 'b') {
          return (
            <strong className="font-semibold text-gray-900">
              {domToReact(nodeChildren, options)}
            </strong>
          );
        }
        if (name === 'em' || name === 'i') {
          return <em className="italic">{domToReact(nodeChildren, options)}</em>;
        }
        if (name === 'u') {
          return (
            <u className="underline underline-offset-2">{domToReact(nodeChildren, options)}</u>
          );
        }
        if (name === 's' || name === 'strike') {
          return (
            <s className="line-through text-gray-400">{domToReact(nodeChildren, options)}</s>
          );
        }

        // ── HR ────────────────────────────────────────────────────────────────
        if (name === 'hr') {
          return <hr className="my-6 border-gray-200" />;
        }

        // ── STRIP leftover ql-ui spans ────────────────────────────────────────
        if (name === 'span' && attribs?.class === 'ql-ui') {
          return <></>;
        }

        return undefined;
      },
    };

    return parse(cleanHTML, options);
  }, [description, className]);

  return (
    <div
      className={`
        parsed-content
        w-full max-w-none
        text-gray-700 text-sm md:text-[15px] leading-relaxed
        [&>*:first-child]:mt-0
        [&>*:last-child]:mb-0
        ${className}
      `.trim()}
    >
      {parsedContent}
    </div>
  );
}