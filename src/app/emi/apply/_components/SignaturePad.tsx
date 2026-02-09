'use client'

import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Upload, Trash2, Check } from 'lucide-react';
import Image from 'next/image';

interface SignaturePadProps {
    onSignatureChange: (file: File | null) => void;
    existingSignature?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, existingSignature }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [mode, setMode] = useState<'upload' | 'draw'>('upload');
    const [hasDrawn, setHasDrawn] = useState(false);
    const [uploadedPreview, setUploadedPreview] = useState<string | null>(existingSignature || null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (mode === 'draw' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
            }
        }
    }, [mode]);

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent): { x: number; y: number } | null => {
        const canvas = canvasRef.current;
        if (!canvas) return null;

        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            const touch = e.touches[0];
            return {
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top
            };
        } else {
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const coords = getCoordinates(e);
        if (!coords || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(coords.x, coords.y);
            setIsDrawing(true);
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const coords = getCoordinates(e);
        if (!coords || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.lineTo(coords.x, coords.y);
            ctx.stroke();
            setHasDrawn(true);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                setHasDrawn(false);
                onSignatureChange(null);
            }
        }
    };

    const saveSignature = () => {
        if (canvasRef.current && hasDrawn) {
            canvasRef.current.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], 'signature.png', { type: 'image/png' });
                    onSignatureChange(file);
                }
            }, 'image/png');
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onSignatureChange(file);
            setUploadedPreview(URL.createObjectURL(file));
        }
    };

    const clearUpload = () => {
        setUploadedPreview(null);
        onSignatureChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Signature (Optional)</span>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant={mode === 'upload' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('upload')}
                    className="flex-1"
                >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload
                </Button>
                <Button
                    type="button"
                    variant={mode === 'draw' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setMode('draw')}
                    className="flex-1"
                >
                    <Pencil className="w-4 h-4 mr-2" />
                    Draw
                </Button>
            </div>

            {mode === 'upload' && (
                <div className="space-y-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="signature-upload"
                    />
                    {uploadedPreview ? (
                        <div className="relative">
                            <div className="relative h-32 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                                <Image src={uploadedPreview} alt="Signature" fill className="object-contain p-2" />
                            </div>
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={clearUpload}
                                className="absolute top-2 right-2"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ) : (
                        <label
                            htmlFor="signature-upload"
                            className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                        >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-500">Click to upload signature</span>
                        </label>
                    )}
                </div>
            )}

            {mode === 'draw' && (
                <div className="space-y-3">
                    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden touch-none">
                        <canvas
                            ref={canvasRef}
                            width={300}
                            height={150}
                            className="w-full cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={clearCanvas}
                            className="flex-1"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                        <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={saveSignature}
                            disabled={!hasDrawn}
                            className="flex-1"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">Draw your signature using mouse or touch</p>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
