'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholderImage?: string;
}

export function ImageUpload({ value, onChange, label, placeholderImage }: ImageUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file.');
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const img = new Image();
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 1200;
                    const MAX_HEIGHT = 1200;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(img, 0, 0, width, height);
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                        onChange(compressedBase64);
                    } else {
                        onChange(reader.result as string);
                    }
                };
            }
        };
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-1.5 w-full">
            {label && (
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">
                    {label}
                </label>
            )}

            <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-2xl aspect-[16/9] w-full flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group ${
                    isDragging
                        ? 'border-signal-orange bg-signal-orange/5 scale-[0.99]'
                        : value
                            ? 'border-white/10'
                            : 'border-white/10 bg-white/2 hover:border-signal-orange/40 hover:bg-signal-orange/1'
                }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleSelect}
                    className="hidden"
                />

                {value ? (
                    <div className="absolute inset-0 w-full h-full group">
                        <img
                            src={value}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <span className="text-white text-xs font-bold font-mono bg-black/60 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                                <Upload className="h-3 w-3 text-signal-orange animate-pulse" />
                                Click to Replace
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleRemove}
                            className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/60 hover:bg-red-500/80 text-white hover:text-white border border-white/10 transition-all z-10"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-6 space-y-2 pointer-events-none select-none">
                        <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:border-signal-orange/30 group-hover:bg-signal-orange/5 transition-colors">
                            <Upload className="h-5 w-5 text-zinc-500 group-hover:text-signal-orange transition-colors" />
                        </div>
                        <div>
                            <p className="text-xs text-white font-bold uppercase tracking-wide">Upload Photo / Cover</p>
                            <p className="text-[9px] text-zinc-500 font-mono mt-0.5 uppercase">Drag and Drop or Click to browse</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
