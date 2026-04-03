'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Eye, Pencil, Trash, X, UploadCloud, FileCheck } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DocumentUploadProps {
  docTypes: string[];
  isGranter?: boolean;
  files: {
    citizenshipFile: Record<string, File | null>;
    granterDocument: Record<string, File | null>;
    bankStatement: File | null;
    userSignature: File | null;
  };
  previews: { [key: string]: string };
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, docType: string, isGranter?: boolean) => void;
  handleFileDelete: (docType: string, isGranter?: boolean) => void;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  docTypes,
  isGranter = false,
  files,
  previews,
  handleFileChange,
  handleFileDelete,
}) => {
  const [zoomData, setZoomData] = React.useState<{ url: string; label: string; key: string } | null>(null);

  const getFile = (docType: string) => {
    if (isGranter) return files.granterDocument?.[docType];
    if (docType === 'bankStatement') return files.bankStatement;
    if (docType === 'userSignature') return files.userSignature;
    return files.citizenshipFile?.[docType];
  };

  const getPreviewKey = (docType: string) => {
    if (isGranter) return `granter-${docType}`;
    if (docType === 'bankStatement') return 'bankStatement';
    if (docType === 'userSignature') return 'userSignature';
    return `citizenship-${docType}`;
  };

  const getLabel = (docType: string) => {
    if (isGranter) {
      return docType === 'ppphoto' ? 'Passport Photo' : `Citizenship ${docType.charAt(0).toUpperCase() + docType.slice(1)}`;
    }
    if (docType === 'bankStatement') return 'Bank Statement';
    if (docType === 'userSignature') return 'Your Signature';
    return docType === 'ppphoto' ? 'Passport Photo' : `Citizenship ${docType.charAt(0).toUpperCase() + docType.slice(1)}`;
  };

  return (
    <div className="bg-white py-4">
      <div className="w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {docTypes.map((docType) => {
            const file = getFile(docType);
            const previewKey = getPreviewKey(docType);
            const label = getLabel(docType);
            return (
              <div key={docType} className="relative group">
                <input
                  type="file"
                  id={previewKey}
                  onChange={(e) => handleFileChange(e, docType, isGranter)}
                  className="hidden"
                  accept="image/*"
                />

                {file ? (
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[var(--colour-fsP2)]/20 shadow-sm bg-gray-50 flex items-center justify-center group-hover:shadow-md transition-all">
                    {previews[previewKey] && (
                      <Image
                        src={previews[previewKey]}
                        alt={label || 'document img'}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-contain p-2"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 bg-white/90 text-[var(--colour-fsP2)] hover:bg-white hover:text-[var(--colour-fsP2)] rounded-full"
                        onClick={() => setZoomData({ url: previews[previewKey], label, key: previewKey })}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-9 w-9 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-transform hover:scale-110"
                        onClick={() => handleFileDelete(docType, isGranter)}
                        title="Remove Document"
                      >
                        <Trash className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor={previewKey} className="cursor-pointer h-48 w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--colour-fsP2)] hover:bg-[var(--colour-fsP2)]/5 transition-all flex flex-col items-center justify-center gap-3 group">
                    <div className="h-12 w-12 rounded-full bg-[var(--colour-fsP2)]/10 flex items-center justify-center group-hover:scale-110 transition-transform text-[var(--colour-fsP2)]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-center px-4">
                      <span className="block text-xs font-bold text-gray-600 group-hover:text-[var(--colour-fsP2)] uppercase tracking-wide">
                        Upload {label?.replace('Citizenship', '')}
                      </span>
                      <span className="block text-[10px] text-gray-400 mt-1 font-medium italic text-center">
                         Max: 300KB | Images only
                      </span>
                    </div>
                  </label>
                )}

                {file && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[var(--colour-fsP2)]">
                    <FileCheck className="w-4 h-4" />
                    <span className="text-xs font-medium text-gray-700 truncate max-w-[150px]">
                      {file.name}
                    </span>
                  </div>
                )}
                {!file && (
                  <p className="mt-2 text-center text-xs text-gray-400 font-medium">
                    {label}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {zoomData && createPortal(
          <div
            className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-200"
            onClick={() => setZoomData(null)}
          >
            <div className="absolute top-0 left-0 right-0 z-[10001] flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent">
                <span className="text-white font-bold text-lg tracking-wide uppercase">
                    {zoomData.label} Preview
                </span>
                <button
                    onClick={() => setZoomData(null)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-white/20 transition-all cursor-pointer"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="relative w-full h-full max-w-4xl max-h-[85vh] mx-4 my-16 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                <Image
                    src={zoomData.url}
                    alt={zoomData.label}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority
                />
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                  <Button
                    onClick={() => {
                        const input = document.getElementById(zoomData.key);
                        input?.click();
                        setZoomData(null);
                    }}
                    className="bg-white/90 backdrop-blur-sm text-gray-900 hover:bg-white rounded-full px-8 py-3 shadow-2xl border border-gray-200 font-bold transition-transform hover:scale-105"
                  >
                    <Pencil className="w-5 h-5 mr-3 text-[var(--colour-fsP2)]" /> Replace Document
                  </Button>
                </div>
            </div>
          </div>,
          document.body
      )}
    </div>
  );
};

export default DocumentUpload;
