/**
 * DevConnect — Edit Profile Header
 * The chrome bar for the Edit Profile page: traffic-light dots,
 * path, the "profile-settings.js" file indicator (with an orange
 * unsaved dot when the form has changes), and a back button.
 *
 * Usage:
 *   import EditProfileHeader from "./EditProfileHeader";
 *   <EditProfileHeader isDirty={isDirty} onBack={() => navigate(-1)} />
 */

import { Link } from "react-router-dom";
export default function MyProfileHeader({ isDirty = false, onBack }) {
    return (
        <div className="bg-[#23252e] border-b border-[#383a46] sticky top-0 z-10">
            <div className="flex items-center gap-2.5 px-5 py-3">
                <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e18a8a]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e8a87c]" />
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8fd19e]" />
                </div>

                <span className="ml-3.5 font-mono text-[0.78rem] text-[#5a5c6b] hidden sm:inline">
                    ~/devconnect/
                </span>

                <div className="flex items-center gap-1.5 font-mono text-[0.78rem] text-[#8b8d9b] min-w-0">
                    {isDirty && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#e8a87c] shrink-0" />
                    )}
                    <span className="truncate">profile-settings.js</span>
                </div>

                <Link to="/devHomePage" className="ml-auto shrink-0 px-4 py-2">
                    <button
                        type="button"
                        onClick={onBack}
                        className="ml-auto shrink-0 px-4 py-2 font-mono text-[0.8rem] border border-[#383a46] rounded text-[#8b8d9b] hover:text-[#e8e9ee] hover:border-[#8b8d9b] transition-colors"
                    >
                        ← back
                    </button>
                </Link>
            </div>
        </div>
    );
}