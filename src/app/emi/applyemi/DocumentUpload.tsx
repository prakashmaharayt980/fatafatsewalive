'use client'

import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Eye, Pencil, Trash, X, UploadCloud, FileCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface DocumentUploadProps {
  docTypes: string[];
  isGranter?: boolean;
  files: any;
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
                  accept="image/*,.pdf"
                />

                {file ? (
                  /* Uploaded State */
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[var(--colour-fsP1)]/20 shadow-sm bg-gray-50 flex items-center justify-center group-hover:shadow-md transition-all">
                    <Image
                      src={previews[previewKey] || ''}
                      alt={label || 'document img'}
                      fill
                      className="object-contain p-2"
                    />

                    {/* Overlay Actions */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="icon" variant="ghost" className="h-9 w-9 bg-white/90 text-[var(--colour-fsP1)] hover:bg-white hover:text-[var(--colour-fsP1)] rounded-full">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
                          <div className="relative w-full h-[80vh] flex items-center justify-center">
                            <Image
                              src={previews[previewKey] || ''}
                              alt={label || 'preview'}
                              fill
                              className="object-contain"
                            />
                            <Button
                              onClick={() => document.getElementById(previewKey)?.click()}
                              className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white text-gray-900 hover:bg-gray-100 rounded-full px-6 shadow-xl"
                            >
                              <Pencil className="w-4 h-4 mr-2" /> Replace
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>

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
                  /* Empty State */
                  <label htmlFor={previewKey} className="cursor-pointer h-48 w-full rounded-xl border-2 border-dashed border-gray-200 hover:border-[var(--colour-fsP1)] hover:bg-[var(--colour-fsP1)]/5 transition-all flex flex-col items-center justify-center gap-3 group">
                    <div className="h-12 w-12 rounded-full bg-[var(--colour-fsP1)]/10 flex items-center justify-center group-hover:scale-110 transition-transform text-[var(--colour-fsP1)]">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500 group-hover:text-[var(--colour-fsP1)] uppercase tracking-wide px-4 text-center">
                      Upload {label?.replace('Citizenship', '')}
                    </span>
                  </label>
                )}

                {file && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-[var(--colour-fsP1)]">
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
    </div>
  );
};

export default DocumentUpload;