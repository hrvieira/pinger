"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800 sticky top-0 z-40">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="shrink-0 flex items-center">
                        <Link
                            href="/"
                            className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            📡 Pinger
                        </Link>
                    </div>

                    {/* Menu do Usuário */}
                    {user && (
                        <div className="flex items-center gap-4">
                            <Link
                                href="/profile"
                                className="hidden sm:flex flex-col items-end cursor-pointer group"
                            >
                                <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {user.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    Minha Conta
                                </span>
                            </Link>

                            {/* Botão de Sair (Mobile Friendly) */}
                            <button
                                onClick={logout}
                                className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                title="Sair"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
