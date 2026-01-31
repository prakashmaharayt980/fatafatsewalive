import React, { useMemo } from 'react';
import parse, { domToReact, HTMLReactParserOptions, Element, DOMNode } from 'html-react-parser';
import DOMPurify from 'dompurify';

type TableElement = Element & {
  children: DOMNode[];
  attribs?: {
    class?: string;
    'data-list'?: string;
  };
};

type TableCellData = {
  data?: string;
  type?: string;
  children?: DOMNode[];
};

interface ParsedContentProps {
  description: string;
  className?: string;
}

export default function ParsedContent({ description, className = '' }: ParsedContentProps) {
  const parsedContent = useMemo(() => {
    if (!description.trim()) {
      return <p className={`text-gray-500 text-base italic ${className}`}>No description available.</p>;
    }

    const options: HTMLReactParserOptions = {
      replace: (domNode: DOMNode) => {
        if (domNode.type !== 'tag') return undefined;

        const element = domNode as TableElement;

        if (element.attribs?.class === 'quill-better-table-wrapper') {
          const firstChild = element.children[0] as TableElement;
          if (!firstChild || firstChild.type !== 'tag') return <></>;

          const table = firstChild.children as TableElement[];
          const thead = (table[0] as TableElement)?.children || [];
          const tbody = (table[1] as TableElement)?.children || [];

          return (
            <div className="overflow-x-auto my-6 rounded-md border border-gray-200">
              <table className="w-full border-collapse bg-white text-base text-gray-700">
                <thead>
                  <tr className="bg-gray-50">
                    {thead
                      .filter((th): th is TableElement => (th as TableElement).type === 'tag')
                      .map((th: TableElement, index) => (
                        <th
                          key={index}
                          className="border-b border-gray-200 p-3 text-left font-semibold text-gray-800 text-sm uppercase"
                          scope="col"
                        >
                          {(th.children[0] as TableCellData)?.data
                            ? parse(DOMPurify.sanitize((th.children[0] as TableCellData).data || ''))
                            : domToReact(th.children, options) || 'N/A'}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {tbody
                    .filter((tr): tr is TableElement => (tr as TableElement).type === 'tag')
                    .map((tr: TableElement, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 transition-colors duration-200">
                        {tr.children
                          .filter((td): td is TableElement => (td as TableElement).type === 'tag')
                          .map((td: TableElement, colIndex) => (
                            <td key={colIndex} className="border-b border-gray-200 p-3 text-gray-700 text-base">
                              {(td.children[0] as TableCellData)?.data
                                ? parse(DOMPurify.sanitize((td.children[0] as TableCellData).data || ''))
                                : domToReact(td.children, options) || 'N/A'}
                            </td>
                          ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (element.name === 'h2') {
          return (
            <h2 className={`text-xl font-semibold text-gray-900 mt-6 mb-4 ${className}`}>
              {domToReact(element.children, options) || 'Untitled Section'}
            </h2>
          );
        }

        if (element.name === 'ul') {
          return (
            <ul className={`list-disc pl-6 space-y-2 my-6 text-gray-700 text-base ${className}`}>
              {domToReact(element.children, options)}
            </ul>
          );
        }

        if (element.attribs?.['data-list'] === 'bullet') {
          return (
            <li className={`text-gray-700 text-base leading-relaxed ${className}`}>
              {domToReact(element.children, options)}
            </li>
          );
        }

        return undefined;
      },
    };

    return parse(DOMPurify.sanitize(description), options);
  }, [description, className]);

  return <div className={className}>{parsedContent}</div>;
}