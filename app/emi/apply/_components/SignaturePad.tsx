'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Upload, Trash2, Check, RotateCcw } from 'lucide-react';
import Image from 'next/image';

interface SignaturePadProps {
    onSignatureChange: (file: File | null) => void;
    existingSignature?: string;
}

type Mode = 'upload' | 'draw';

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange, existingSignature }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [mode, setMode] = useState<Mode>('upload');
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [uploadedPreview, setUploadedPreview] = useState<string | null>(existingSignature ?? null);

    // ── Canvas init — respects devicePixelRatio and actual wrapper width ──────
    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const ratio = window.devicePixelRatio || 1;
        const w = wrapper.clientWidth;
        const h = 160;

        canvas.width = w * ratio;
        canvas.height = h * ratio;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${h}px`;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.scale(ratio, ratio);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        ctx.strokeStyle = '#111827';
        ctx.lineWidth = 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, []);

    useEffect(() => {
        if (mode !== 'draw') return;
        const t = setTimeout(initCanvas, 0); // after DOM paint
        window.addEventListener('resize', initCanvas);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', initCanvas);
        };
    }, [mode, initCanvas]);

    // ── Pointer helpers ───────────────────────────────────────────────────────
    const getXY = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            const t = e.touches[0];
            return { x: t.clientX - rect.left, y: t.clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const pt = getXY(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!pt || !ctx) return;
        ctx.beginPath();
        ctx.moveTo(pt.x, pt.y);
        setIsDrawing(true);
        setIsSaved(false);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const pt = getXY(e);
        const ctx = canvasRef.current?.getContext('2d');
        if (!pt || !ctx) return;
        ctx.lineTo(pt.x, pt.y);
        ctx.stroke();
        setHasDrawn(true);
    };

    const stopDrawing = () => setIsDrawing(false);

    // ── Draw actions ──────────────────────────────────────────────────────────
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
        setIsSaved(false);
        onSignatureChange(null);
    };

    const saveSignature = () => {
        if (!canvasRef.current || !hasDrawn) return;
        canvasRef.current.toBlob(blob => {
            if (!blob) return;
            onSignatureChange(new File([blob], 'signature.png', { type: 'image/png' }));
            setIsSaved(true);
        }, 'image/png');
    };

    // ── Upload actions ────────────────────────────────────────────────────────
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onSignatureChange(file);
        setUploadedPreview(URL.createObjectURL(file));
    };

    const clearUpload = () => {
        setUploadedPreview(null);
        onSignatureChange(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const switchMode = (m: Mode) => {
        setMode(m);
        setHasDrawn(false);
        setIsSaved(false);
    };

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-3">

            {/* Label */}
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Signature{' '}
                <span className="normal-case font-normal text-gray-400">(optional)</span>
            </p>

            {/* Mode toggle */}
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 gap-0.5">
                {(['upload', 'draw'] as Mode[]).map(m => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => switchMode(m)}
                        className={[
                            'flex items-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-medium transition-all',
                            mode === m
                                ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:text-gray-700',
                        ].join(' ')}
                    >
                        {m === 'upload'
                            ? <Upload className="w-3.5 h-3.5" />
                            : <Pencil className="w-3.5 h-3.5" />}
                        {m === 'upload' ? 'Upload' : 'Draw'}
                    </button>
                ))}
            </div>

            {/* ── Upload mode ── */}
            {mode === 'upload' && (
                <>
                    <input
                        ref={fileInputRef}
                        id="sig-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    {uploadedPreview ? (
                        <div className="relative group rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                            <div className="relative h-32">
                                <Image src={uploadedPreview} alt="Signature" fill className="object-contain p-4" />
                            </div>
                            {/* Saved badge */}
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Uploaded
                            </div>
                            {/* Delete button — appears on hover */}
                            <button
                                type="button"
                                onClick={clearUpload}
                                className="absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 opacity-0 group-hover:opacity-100 transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <label
                            htmlFor="sig-upload"
                            className="flex flex-col items-center justify-center h-32 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                        >
                            <Upload className="w-6 h-6 text-gray-300 mb-2" />
                            <span className="text-xs font-medium text-gray-500">Click to upload</span>
                            <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 5 MB</span>
                        </label>
                    )}
                </>
            )}

            {/* ── Draw mode ── */}
            {mode === 'draw' && (
                <div className="space-y-2">

                    {/* Canvas wrapper — ref used for width measurement */}
                    <div
                        ref={wrapperRef}
                        className="relative rounded-xl border border-gray-200 bg-white overflow-hidden touch-none"
                    >
                        <canvas
                            ref={canvasRef}
                            className="block w-full cursor-crosshair"
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseLeave={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                        />

                        {/* Empty state */}
                        {!hasDrawn && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <span className="text-xs text-gray-300 select-none">Sign here</span>
                            </div>
                        )}

                        {/* Saved badge */}
                        {isSaved && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" /> Saved
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] text-gray-400 text-center">
                        Use mouse or finger to draw your signature
                    </p>

                    {/* Controls */}
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={clearCanvas}
                            disabled={!hasDrawn}
                            className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={saveSignature}
                            disabled={!hasDrawn || isSaved}
                            className={[
                                'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-medium transition-all border',
                                hasDrawn && !isSaved
                                    ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-700'
                                    : 'opacity-40 cursor-not-allowed bg-gray-900 text-white border-gray-900',
                            ].join(' ')}
                        >
                            <Check className="w-3.5 h-3.5" />
                            {isSaved ? 'Saved' : 'Save signature'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;