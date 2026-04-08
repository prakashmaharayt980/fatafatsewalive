'use client'

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Pencil, Check, RotateCcw, Maximize2, X } from 'lucide-react';

interface SignaturePadProps {
    onSignatureChange: (file: File | null) => void;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onSignatureChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const savedDataRef = useRef<string | null>(null);
    const hasDrawnRef = useRef(false);

    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const initCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        const wrapper = wrapperRef.current;
        if (!canvas || !wrapper) return;

        const ratio = window.devicePixelRatio || 1;
        const w = wrapper.clientWidth;
        const h = isFullscreen ? Math.max(240, Math.floor(window.innerHeight * 0.45)) : 160;

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
        ctx.lineWidth = isFullscreen ? 2.4 : 1.8;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (savedDataRef.current) {
            const img = new window.Image();
            img.onload = () => ctx.drawImage(img, 0, 0, w, h);
            img.src = savedDataRef.current;
        }
    }, [isFullscreen]);

    useEffect(() => {
        const t = setTimeout(initCanvas, 0);
        window.addEventListener('resize', initCanvas);
        return () => {
            clearTimeout(t);
            window.removeEventListener('resize', initCanvas);
        };
    }, [initCanvas]);

    useEffect(() => {
        document.body.style.overflow = isFullscreen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isFullscreen]);

    const snapshotCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) savedDataRef.current = canvas.toDataURL();
    };

    const openFullscreen = () => {
        snapshotCanvas();
        setIsFullscreen(true);
    };

    const closeFullscreen = () => {
        if (hasDrawnRef.current) snapshotCanvas();
        setIsFullscreen(false);
    };

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
        if (!hasDrawnRef.current) {
            hasDrawnRef.current = true;
            setHasDrawn(true);
        }
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;
        const w = parseInt(canvas.style.width) || canvas.width;
        const h = parseInt(canvas.style.height) || canvas.height;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
        savedDataRef.current = null;
        hasDrawnRef.current = false;
        setHasDrawn(false);
        setIsSaved(false);
        onSignatureChange(null);
    };

    const saveSignature = () => {
        if (!canvasRef.current || !hasDrawnRef.current) return;
        const canvas = canvasRef.current;
        canvas.toBlob(blob => {
            if (!blob) return;
            onSignatureChange(new File([blob], 'signature.png', { type: 'image/png' }));
            setIsSaved(true);
            if (isFullscreen) {
                savedDataRef.current = canvas.toDataURL();
                setIsFullscreen(false);
            }
        }, 'image/png');
    };

    const canvasArea = (
        <div className="space-y-3">
            <div
                ref={wrapperRef}
                className="relative rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden touch-none hover:border-gray-300 transition-colors"
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
                {!hasDrawn && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none gap-1.5">
                        <Pencil className="w-5 h-5 text-gray-200" />
                        <span className="text-xs text-gray-300 select-none">Sign here</span>
                    </div>
                )}
                {isSaved && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Saved
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={clearCanvas}
                    disabled={!hasDrawn}
                    className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear
                </button>
                <button
                    type="button"
                    onClick={saveSignature}
                    disabled={!hasDrawn || isSaved}
                    className={[
                        'flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-semibold transition-all border',
                        hasDrawn && !isSaved
                            ? 'bg-gray-900 text-white border-gray-900 hover:bg-gray-700 shadow-sm'
                            : 'opacity-30 cursor-not-allowed bg-gray-900 text-white border-gray-900',
                    ].join(' ')}
                >
                    <Check className="w-3.5 h-3.5" />
                    {isSaved ? 'Saved' : 'Save'}
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Signature <span className="normal-case font-normal text-gray-400">(optional)</span>
                </p>
                {!isFullscreen && (
                    <button
                        type="button"
                        onClick={openFullscreen}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                    >
                        <Maximize2 className="w-3 h-3" />
                        Expand
                    </button>
                )}
            </div>

            {!isFullscreen && canvasArea}

            {isFullscreen && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
                    onClick={(e) => { if (e.target === e.currentTarget) closeFullscreen(); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-800">Draw your signature</h3>
                                <p className="text-[11px] text-gray-400 mt-0.5">Use mouse or finger — tap Save when done</p>
                            </div>
                            <button
                                type="button"
                                onClick={closeFullscreen}
                                className="flex items-center justify-center w-8 h-8 rounded-lg border border-gray-100 text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5">
                            {canvasArea}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SignaturePad;
