import { Leaf, Search, ChevronDown, User, Settings, LogOut } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Input } from "../components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const TopBar = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [query, setQuery] = useState("");

    const mockAction = (label) => toast.success(`${label} — coming soon`);

    return (
        <header
            data-testid="top-bar"
            className="flex items-center justify-between gap-6 px-2 sm:px-4 py-5"
        >
            <div className="flex items-center gap-3">
                <motion.div
                    initial={{ rotate: -20, scale: 0.8, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 180,
                        damping: 14,
                        delay: 0.1,
                    }}
                    className="relative grid h-10 w-10 place-items-center rounded-xl"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(16,185,129,0.12))",
                        border: "1px solid rgba(34,197,94,0.25)",
                        boxShadow:
                            "0 0 24px rgba(34,197,94,0.22), inset 0 1px 0 rgba(255,255,255,0.08)",
                    }}
                >
                    <Leaf className="h-5 w-5 text-emerald-400" strokeWidth={2.4} />
                </motion.div>
                <div className="flex flex-col leading-tight">
                    <h1
                        data-testid="app-title"
                        className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-white"
                    >
                        Yam Leaf Disease Detector
                    </h1>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-emerald-400/80 font-mono">
                        Lesion Analysis · v0.1
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <AnimatePresence initial={false} mode="wait">
                    {searchOpen ? (
                        <motion.div
                            key="search-field"
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 240, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 220,
                                damping: 26,
                            }}
                            className="overflow-hidden"
                        >
                            <Input
                                data-testid="search-input"
                                autoFocus
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onBlur={() => !query && setSearchOpen(false)}
                                placeholder="Search diseases…"
                                className="h-10 rounded-full border-white/10 bg-white/5 text-sm text-slate-200 placeholder:text-slate-500 focus-visible:ring-emerald-400/40"
                            />
                        </motion.div>
                    ) : (
                        <motion.button
                            key="search-icon"
                            data-testid="search-toggle"
                            onClick={() => setSearchOpen(true)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            whileHover={{
                                scale: 1.08,
                                backgroundColor: "rgba(255,255,255,0.06)",
                            }}
                            whileTap={{ scale: 0.95 }}
                            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.02] text-slate-300 transition"
                            aria-label="Search"
                        >
                            <Search className="h-4 w-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button
                            data-testid="profile-trigger"
                            className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 transition hover:bg-white/[0.06]"
                        >
                            <Avatar className="h-8 w-8 ring-1 ring-white/10">
                                <AvatarImage
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80&auto=format&fit=crop&crop=faces"
                                    alt="John Doe"
                                />
                                <AvatarFallback className="bg-emerald-500/20 text-emerald-300 text-xs">
                                    JD
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium text-slate-200">
                                John Doe
                            </span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        data-testid="profile-menu"
                        align="end"
                        sideOffset={10}
                        className="w-56 border-white/10 bg-[#0c1324]/90 text-slate-200 backdrop-blur-xl"
                    >
                        <DropdownMenuLabel className="text-slate-400 text-xs uppercase tracking-widest">
                            Account
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            data-testid="menu-profile"
                            onClick={() => mockAction("Profile")}
                            className="cursor-pointer focus:bg-white/5"
                        >
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            data-testid="menu-settings"
                            onClick={() => mockAction("Settings")}
                            className="cursor-pointer focus:bg-white/5"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem
                            data-testid="menu-logout"
                            onClick={() => mockAction("Logout")}
                            className="cursor-pointer text-rose-300 focus:bg-rose-500/10 focus:text-rose-200"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
};
