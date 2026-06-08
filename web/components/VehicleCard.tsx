// web/components/VehicleCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Vehicle } from '../types';

interface Props {
    vehicle: Vehicle;
}

export function VehicleCard({ vehicle }: Props) {
    return (
        <Link href={`/vehicle/${vehicle.id}`} className="group block h-full">
            <div className="bg-steel border border-border-dim rounded-xl overflow-hidden shadow-lg transition-transform duration-300 group-hover:scale-[1.02] group-hover:border-signal-orange/50 h-full flex flex-col">

                {/* Image Area */}
                <div className="relative aspect-video bg-steel-light">
                    {vehicle.image_url ? (
                        <Image
                            src={vehicle.image_url}
                            alt={`${vehicle.make} ${vehicle.model}`}
                            fill
                            unoptimized
                            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-dim font-bold text-2xl">
                            {vehicle.make}
                        </div>
                    )}

                    {/* Health Badge Overlay */}
                    <div className="absolute top-3 right-3 backdrop-blur-md bg-black/60 border border-green-500 rounded-full w-12 h-12 flex flex-col items-center justify-center shadow-lg">
                        <span className="text-green-500 font-bold text-lg leading-none">{vehicle.health_score}</span>
                        <span className="text-[0.6rem] text-green-500 font-bold uppercase tracking-wider">HP</span>
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-4 flex flex-col flex-grow">
                    <div className="mb-4">
                        <div className="text-signal-orange text-xs font-bold mb-1">{vehicle.year}</div>
                        <h3 className="text-2xl font-black text-text-main tracking-tight uppercase leading-none mb-1">
                            {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="text-text-dim text-sm font-medium">
                            {vehicle.trim}
                        </div>
                    </div>

                    <div className="mt-auto pt-3 border-t border-border-dim flex justify-between items-center text-xs text-text-dim font-mono">
                        <span className="tracking-widest">VIN: •••••{vehicle.vin.slice(-4)}</span>
                        <span className="text-xs font-bold tracking-widest text-text-dim group-hover:text-text-main transition-colors">VERIFIED</span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
