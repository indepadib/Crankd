'use client';
import React, { useState } from 'react';

// Mock Data
const INITIAL_INVENTORY = [
    { id: '1', year: 2003, make: 'BMW', model: 'M3 CSL', color: 'Silver Grey', price: '$85,000', status: 'Active' },
    { id: '2', year: 2018, make: 'Porsche', model: '911 GT3', color: 'Chalk', price: '$185,900', status: 'Pending' },
    { id: '3', year: 1999, make: 'Nissan', model: 'Skyline GT-R', color: 'Midnight Purple', price: '$120,000', status: 'Sold' },
    { id: '4', year: 2023, make: 'Toyota', model: 'GR Corolla', color: 'Heavy Metal', price: '$45,000', status: 'Active' },
];

export default function InventoryPage() {
    const [vehicles, setVehicles] = useState(INITIAL_INVENTORY);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight mb-2">Inventory Management</h2>
                    <p className="text-zinc-400">Manage your active listings and vehicle verification status.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add Vehicle
                </button>
            </div>

            {/* Inventory Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-zinc-950 text-zinc-500 text-xs uppercase tracking-wider">
                        <tr>
                            <th className="p-4 font-medium">Vehicle</th>
                            <th className="p-4 font-medium">Spec</th>
                            <th className="p-4 font-medium">Price</th>
                            <th className="p-4 font-medium">Status</th>
                            <th className="p-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {vehicles.map((car) => (
                            <tr key={car.id} className="hover:bg-zinc-800/50 transition-colors">
                                <td className="p-4">
                                    <div>
                                        <p className="font-bold text-white">{car.year} {car.make} {car.model}</p>
                                        <p className="text-xs text-zinc-500">VIN: WBS...{car.id}X99</p>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-zinc-300">{car.color}</td>
                                <td className="p-4 font-mono font-bold text-white">{car.price}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${car.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                                            car.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                                'bg-zinc-700/50 text-zinc-400'
                                        }`}>
                                        {car.status}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button className="text-zinc-500 hover:text-white px-2">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mock Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4">Add New Vehicle</h3>
                        <p className="text-zinc-400 mb-6 text-sm">
                            Enter the VIN to auto-populate details using the Crankd decoder service.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-zinc-500 mb-1">VIN Number</label>
                                <input className="w-full bg-black border border-zinc-800 rounded p-3 text-white font-mono" placeholder="WPOAA..." />
                            </div>

                            <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded flex items-center gap-3">
                                <span className="text-xl">💡</span>
                                <p className="text-xs text-orange-200">
                                    Pro Tip: Drag & Drop a CSV file to upload multiple vehicles at once.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-4 py-2 text-zinc-400 hover:text-white"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-6 py-2 bg-white text-black font-bold rounded hover:bg-zinc-200"
                            >
                                Decode & Add
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
