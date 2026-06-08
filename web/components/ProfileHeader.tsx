import Link from 'next/link';
import Image from 'next/image';
import { Settings, MapPin, Link as LinkIcon, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
    user: {
        name: string;
        handle: string;
        bio: string;
        location: string;
        website: string;
        joinDate: string;
        avatar: string;
        banner: string;
        stats: {
            garageValue: string;
            followers: string;
            following: string;
        }
    }
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
    return (
        <div className="relative mb-8">
            {/* Banner Image */}
            <div className="h-64 md:h-80 w-full overflow-hidden rounded-3xl relative">
                <Image
                    src={user.banner}
                    alt="Cover"
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent opacity-80" />
            </div>

            <div className="px-4 md:px-8 relative -mt-20">
                <div className="flex flex-col md:flex-row items-end md:items-end gap-6">

                    {/* Avatar */}
                    <div className="relative h-32 w-32 md:h-40 md:w-40 rounded-full border-4 border-carbon bg-steel overflow-hidden shadow-2xl">
                        {user.avatar.startsWith('http') ? (
                            <Image
                                src={user.avatar}
                                alt={user.name}
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-steel-light text-text-dim text-4xl font-bold">
                                {user.avatar}
                            </div>
                        )}
                        <div className="absolute bottom-2 right-2 h-6 w-6 bg-signal-orange rounded-full border-2 border-carbon" title="Pro Member" />
                    </div>

                    {/* Actions & Names */}
                    <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 pb-2">
                        <div>
                            <h1 className="text-3xl font-black text-text-main tracking-tighter uppercase">{user.name}</h1>
                            <div className="text-text-dim font-medium">{user.handle}</div>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 bg-white text-carbon font-bold rounded-lg hover:bg-gray-200 transition-colors">
                                Edit Profile
                            </button>
                            <button className="p-2 border border-border-dim rounded-lg text-text-dim hover:text-text-main hover:border-text-dim transition-colors">
                                <Settings className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bio & Stats */}
                <div className="mt-6 md:pl-48 space-y-4">
                    <p className="text-text-main max-w-2xl leading-relaxed">
                        {user.bio}
                    </p>

                    <div className="flex flex-wrap gap-4 text-sm text-text-dim">
                        <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {user.location}
                        </div>
                        <div className="flex items-center gap-1">
                            <LinkIcon className="h-4 w-4" />
                            <a href={`https://${user.website}`} className="text-signal-orange hover:underline">{user.website}</a>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            Joined {user.joinDate}
                        </div>
                    </div>

                    <div className="flex gap-8 pt-2 border-t border-white/5 mt-4">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-text-main">{user.stats.garageValue}</span>
                            <span className="text-xs text-text-dim uppercase tracking-wider">Garage Value</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-text-main">{user.stats.followers}</span>
                            <span className="text-xs text-text-dim uppercase tracking-wider">Followers</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-text-main">{user.stats.following}</span>
                            <span className="text-xs text-text-dim uppercase tracking-wider">Following</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
