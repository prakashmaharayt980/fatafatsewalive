/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useMemo, useEffect, useRef } from 'react';
import parse, { domToReact, type HTMLReactParserOptions, type Element, type DOMNode, type Text } from 'html-react-parser';
import { sanitizeHtml } from '@/lib/dompurify';
import { cn } from '@/lib/utils';

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface ParsedContentProps {
  description: string;
  className?: string;
  onTocExtracted?: (items: TocItem[]) => void;
}

const isElement = (node: DOMNode): node is Element => node.type === 'tag';
const isText = (node: DOMNode): node is Text => node.type === 'text';

const isQuillUiSpan = (node: DOMNode): boolean =>
  isElement(node) && (node as Element).name === 'span' && (node as Element).attribs?.class === 'ql-ui';

const getQuillClasses = (attribs: Record<string, string> | undefined): string => {
  if (!attribs) return '';
  const classes: string[] = [];
  const align = attribs['class']?.match(/ql-align-(\w+)/);
  if (align?.[1] === 'justify') classes.push('text-justify');
  if (align?.[1] === 'center') classes.push('text-center');
  if (align?.[1] === 'right') classes.push('text-right');
  const indent = attribs['class']?.match(/ql-indent-(\d+)/);
  if (indent?.[1]) classes.push(`pl-${parseInt(indent[1], 10) * 4}`);
  return classes.join(' ');
};

const isEmptyQuillParagraph = (node: Element): boolean => {
  const kids = node.children as DOMNode[];
  return (
    kids.length === 0 ||
    (kids.length === 1 && isElement(kids[0]) && (kids[0] as Element).name === 'br') ||
    (kids.length === 1 && isText(kids[0]) && !(kids[0] as Text).data?.trim())
  );
};

const getNodeText = (nodes: DOMNode[]): string =>
  nodes.reduce<string>((acc, n) => {
    if (isText(n)) return acc + ((n as Text).data ?? '');
    if (isElement(n)) return acc + getNodeText((n as Element).children as DOMNode[]);
    return acc;
  }, '').trim();

// Pure function — same ID algorithm as the parse pass.
// Use for eager initialisation (avoids layout shift from async setState).
export function extractTocItems(html: string): TocItem[] {
  if (!html) return [];
  const regex = /<h([23])[^>]*>([\s\S]*?)<\/h[23]>/gi;
  const items: TocItem[] = [];
  const idCounter: Record<string, number> = {};
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    const level = parseInt(match[1]);
    const text = match[2].replace(/<[^>]*>/g, '').trim();
    if (!text) continue;
    const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const count = idCounter[baseId] ?? 0;
    const id = count === 0 ? baseId : `${baseId}-${count}`;
    idCounter[baseId] = count + 1;
    items.push({ id, text, level });
  }
  return items;
}

export default function ParsedContent({ description, className = '', onTocExtracted }: ParsedContentProps) {
  const callbackRef = useRef(onTocExtracted);
  callbackRef.current = onTocExtracted;

  const { parsedJSX, tocItems } = useMemo(() => {
    if (!description) {
      return {
        parsedJSX: <p className="text-gray-400 italic text-sm">No description available.</p>,
        tocItems: [] as TocItem[],
      };
    }

    const cleanHTML = sanitizeHtml(description, {
      ADD_TAGS: ['iframe', 'span'],
      ADD_ATTR: [
        'allow', 'allowfullscreen', 'frameborder', 'src', 'style',
        'width', 'height', 'loading', 'id', 'class', 'data-list', 'data-indent',
      ],
    });

    const collected: TocItem[] = [];
    const idCounter: Record<string, number> = {};

    const headingStyles: Record<string, string> = {
      h2: 'text-xl md:text-2xl font-bold text-[var(--colour-text2)] mt-5 mb-3 leading-snug',
      h3: 'text-lg md:text-xl font-bold text-gray-800 mt-4 mb-2 leading-snug',
      h4: 'text-base md:text-lg font-bold text-gray-800 mt-3 mb-1.5 leading-snug',
      h5: 'text-sm md:text-base font-bold text-gray-700 mt-2 mb-1',
      h6: 'text-xs font-bold text-gray-500 mt-2 mb-1 uppercase tracking-[0.05em]',
    };

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
          const quillClass = getQuillClasses(attribs);
          if (isBullet) {
            return (
              <ul className={cn("list-disc list-outside pl-5 my-3 space-y-1.5 text-gray-700 text-sm md:text-[15px] leading-relaxed marker:text-(--colour-fsP1,#f86014)", quillClass)}>
                {domToReact(nodeChildren, options)}
              </ul>
            );
          }
          return (
            <ol className={cn("list-decimal list-outside pl-5 my-3 space-y-1.5 text-gray-700 text-sm md:text-[15px] leading-relaxed marker:text-(--colour-fsP2,#1967b3) marker:font-medium", quillClass)}>
              {domToReact(nodeChildren, options)}
            </ol>
          );
        }

        // ── UL ────────────────────────────────────────────────────────────────
        if (name === 'ul') {
          const quillClass = getQuillClasses(attribs);
          return (
            <ul className={cn("list-disc list-outside pl-5 my-3 space-y-1.5 text-gray-700 text-sm md:text-[15px] leading-relaxed marker:text-(--colour-fsP1,#f86014)", quillClass)}>
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

        // ── TABLE (Quill wrapper) ─────────────────────────────────────────────
        if (attribs?.class?.includes('quill-better-table-wrapper')) {
          const tableNode = nodeChildren.find(isElement);
          if (!tableNode) return null;
          const tableChildren = (tableNode.children as DOMNode[]).filter(isElement);
          const thead = tableChildren.find(n => n.name === 'thead') as Element;
          const tbody = tableChildren.find(n => n.name === 'tbody') as Element;
          const tableBodyRows = tbody ? (tbody.children as DOMNode[]).filter(isElement) : [];

          return (
            <div className="w-full overflow-x-auto my-4 rounded border border-gray-200">
              <table className="w-full border-collapse text-xs sm:text-sm text-left">
                {thead ? (
                  <thead className="bg-gray-100 text-gray-900 border-b-2 border-gray-200">
                    {(thead.children as DOMNode[]).filter(isElement).map((tr, i) => (
                      <tr key={i}>
                        {(tr.children as DOMNode[]).filter(isElement).map((cell, j) => (
                          <th key={j} className="px-2 py-2 sm:px-3 sm:py-2.5 font-bold uppercase tracking-wide text-[10px] sm:text-[11px] border-r border-gray-200 last:border-r-0 whitespace-nowrap">
                            {domToReact(cell.children as DOMNode[], options)}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                ) : tableBodyRows.length > 0 && (
                  <thead className="bg-gray-50 text-gray-900 border-b border-gray-200">
                    <tr>
                      {((tableBodyRows[0] as Element).children as DOMNode[]).filter(isElement).map((cell, j) => (
                        <th key={j} className="px-2 py-2 sm:px-3 sm:py-2.5 font-bold text-[11px] sm:text-[13px] border-r border-gray-200 last:border-r-0 whitespace-nowrap">
                          {domToReact(cell.children as DOMNode[], options)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody className="divide-y divide-gray-100 bg-white">
                  {(thead ? tableBodyRows : tableBodyRows.slice(1)).map((tr, i) => (
                    <tr key={i} className="even:bg-gray-50/50">
                      {(tr.children as DOMNode[]).filter(isElement).map((cell, j) => (
                        <td key={j} className="px-2 py-1.5 sm:px-3 sm:py-2 text-gray-700 border-r border-gray-100 last:border-r-0 align-top leading-relaxed">
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

        // ── TABLE (plain HTML) ────────────────────────────────────────────────
        if (name === 'table') {
          return (
            <div className="w-full overflow-x-auto my-4 rounded border border-gray-200">
              <table className="w-full border-collapse text-xs sm:text-sm text-left">
                {domToReact(nodeChildren, options)}
              </table>
            </div>
          );
        }
        if (name === 'thead') {
          return <thead className="bg-gray-100 text-gray-900 border-b-2 border-gray-200">{domToReact(nodeChildren, options)}</thead>;
        }
        if (name === 'tbody') {
          return <tbody className="divide-y divide-gray-100 bg-white">{domToReact(nodeChildren, options)}</tbody>;
        }
        if (name === 'tr') {
          return <tr className="even:bg-gray-50/50">{domToReact(nodeChildren, options)}</tr>;
        }
        if (name === 'th') {
          return <th className="px-2 py-2 sm:px-3 sm:py-2.5 font-bold uppercase tracking-wide text-[10px] sm:text-[11px] border-r border-gray-200 last:border-r-0 whitespace-nowrap">{domToReact(nodeChildren, options)}</th>;
        }
        if (name === 'td') {
          return <td className="px-2 py-1.5 sm:px-3 sm:py-2 text-gray-700 border-r border-gray-100 last:border-r-0 align-top leading-relaxed">{domToReact(nodeChildren, options)}</td>;
        }

        // ── IMAGE ─────────────────────────────────────────────────────────────
        if (name === 'img') {
          const { src = '', alt = 'Content image', width } = attribs;
          const isDataUrl = src.startsWith('data:');
          const absoluteUrl = isDataUrl || src.startsWith('http')
            ? src
            : `https://fatafatsewa.com${src.startsWith('/') ? src : `/${src}`}`;
          // Respect original width as max-width so image never exceeds its natural size
          // but still shrinks on smaller screens (responsive)
          const maxWidth = width ? `${parseInt(width, 10)}px` : undefined;
          return (
            <span
              className="block my-4 rounded-lg overflow-hidden border border-gray-100"
              style={maxWidth ? { maxWidth } : undefined}
            >
              <img
                src={absoluteUrl}
                alt={alt}
                {...(!isDataUrl && { loading: 'lazy' as const })}
                className="w-full h-auto block"
              />
            </span>
          );
        }

        // ── IFRAME ────────────────────────────────────────────────────────────
        if (name === 'iframe') {
          const { src, title, allow, allowFullScreen, width, height } = attribs || {};
          return (
            <span className="block w-full my-4 rounded-lg overflow-hidden aspect-video">
              <iframe src={src} title={title} allow={allow} allowFullScreen={!!allowFullScreen} width={width} height={height} className="w-full h-full" style={{ minHeight: '300px' }} />
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
          const { href, target, rel } = attribs || {};
          return (
            <a
              href={href}
              className="text-(--colour-fsP2,#1967b3) underline underline-offset-4 decoration-[1.5px] decoration-(--colour-fsP2,#1967b3)/30 hover:decoration-(--colour-fsP2,#1967b3) hover:text-blue-800 transition-all duration-200 font-medium"
              target={target || '_blank'}
              rel={rel || 'noopener noreferrer'}
            >
              {domToReact(nodeChildren, options)}
            </a>
          );
        }

        // ── PARAGRAPH ─────────────────────────────────────────────────────────
        if (name === 'p') {
          if (isEmptyQuillParagraph(domNode)) return <span className="block h-2" />;
          const quillClass = getQuillClasses(attribs);
          return (
            <p className={cn("text-gray-700 text-sm md:text-[15px] leading-relaxed my-3", quillClass)}>
              {domToReact(nodeChildren, options)}
            </p>
          );
        }

        // ── HEADINGS ──────────────────────────────────────────────────────────
        if (/^h[1-6]$/.test(name)) {
          if (name === 'h1') return null;

          const quillClass = getQuillClasses(attribs);
          const Tag = name as 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

          if (name === 'h2' || name === 'h3') {
            const text = getNodeText(nodeChildren);
            if (text) {
              const baseId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
              const count = idCounter[baseId] ?? 0;
              const id = count === 0 ? baseId : `${baseId}-${count}`;
              idCounter[baseId] = count + 1;
              collected.push({ id, text, level: parseInt(name[1]) });
              return React.createElement(
                Tag,
                { id, className: cn(headingStyles[name], quillClass).trim() },
                domToReact(nodeChildren, options)
              );
            }
          }

          return React.createElement(
            Tag,
            { className: cn(headingStyles[name], quillClass).trim() },
            domToReact(nodeChildren, options)
          );
        }

        // ── INLINE FORMATTING ─────────────────────────────────────────────────
        if (name === 'strong' || name === 'b') {
          return <strong className="font-semibold text-gray-900">{domToReact(nodeChildren, options)}</strong>;
        }
        if (name === 'em' || name === 'i') {
          return <em className="italic">{domToReact(nodeChildren, options)}</em>;
        }
        if (name === 'u') {
          return <u className="underline underline-offset-2">{domToReact(nodeChildren, options)}</u>;
        }
        if (name === 's' || name === 'strike') {
          return <s className="line-through text-gray-400">{domToReact(nodeChildren, options)}</s>;
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

    return { parsedJSX: parse(cleanHTML, options), tocItems: collected };
  }, [description]);

  useEffect(() => {
    callbackRef.current?.(tocItems);
  }, [tocItems]);

  return (
    <div
      className={cn(
        'parsed-content w-full max-w-none text-gray-700 text-sm md:text-[15px] leading-relaxed [&>*:first-child]:mt-0 [&>*:last-child]:mb-0',
        className
      )}
    >
      {parsedJSX}
    </div>
  );
}
