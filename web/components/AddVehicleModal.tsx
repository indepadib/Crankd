
'use client';

import React, { useState } from 'react';
import { X, Loader2, Check, Search, Car, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddVehicleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (data: any) => Promise<void>;
}

export function AddVehicleModal({ isOpen, onClose, onAdd }: AddVehicleModalProps) {
    const [step, setStep] = useState<'vin' | 'details' | 'success'>('vin');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [vin, setVin] = useState('');
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const reset = () => {
        setStep('vin');
        setVin('');
        setMake('');
        setModel('');
        setYear('');
        setImageUrl('');
        setError(null);
    };

    const handleVinSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Simulate VIN decoding
        setTimeout(() => {
            setLoading(false);
            // Mock result
            setMake('Toyota');
            setModel('Supra');
            setYear('1994');
            setImageUrl('https://images.unsplash.com/photo-1555215695-3004980adade?q=80&w=2600');
            setStep('details');
        }, 1500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await onAdd({ make, model, year: parseInt(year), image_url: imageUrl });
            setStep('success');
            setTimeout(() => {
                onClose();
                reset();
            }, 2000);
        } catch (err) {
            setError('Failed to add vehicle');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
                        <h2 className="text-xl font-black text-white uppercase tracking-tight">Add New Machine</h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 'vin' && (
                            <form onSubmit={handleVinSearch} className="space-y-6">
                                <div className="text-center space-y-2">
                                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                                        <Search className="h-8 w-8 text-signal-orange" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white">Decoder</h3>
                                    <p className="text-sm text-zinc-400">Enter VIN to auto-populate specs.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-zinc-500">VIN Number</label>
                                    <input
                                        type="text"
                                        value={vin}
                                        onChange={e => setVin(e.target.value)}
                                        placeholder="JM1NA35..."
                                        className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal-orange transition-colors font-mono uppercase"
                                    />
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep('details')}
                                        className="flex-1 py-3 font-bold text-zinc-400 hover:text-white transition-colors"
                                    >
                                        Skip to Manual
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading || vin.length < 5}
                                        className="flex-1 bg-signal-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Decode VIN'}
                                    </button>
                                </div>
                            </form>
                        )}

                        {step === 'details' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-zinc-500">Make</label>
                                        <input
                                            required
                                            value={make}
                                            onChange={e => setMake(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal-orange"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-zinc-500">Model</label>
                                        <input
                                            required
                                            value={model}
                                            onChange={e => setModel(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal-orange"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-zinc-500">Year</label>
                                        <input
                                            required
                                            type="number"
                                            value={year}
                                            onChange={e => setYear(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal-orange"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-zinc-500">Image URL</label>
                                        <input
                                            value={imageUrl}
                                            onChange={e => setImageUrl(e.target.value)}
                                            className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-signal-orange"
                                        />
                                    </div>
                                </div>

                                {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-4 bg-white text-black font-black uppercase rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register Machine'}
                                </button>
                            </form>
                        )}

                        {step === 'success' && (
                            <div className="text-center space-y-4 py-8">
                                <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500 border border-green-500/20">
                                    <Check className="h-10 w-10" />
                                </div>
                                <h3 className="text-2xl font-black text-white uppercase">Welcome to the Fleet</h3>
                                <p className="text-zinc-400">Your machine has been registered.</p>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
