"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export function Header() {
    const { user, logout } = useAuth();

    return (
        <header className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo / Nome do App */}
                    <div className="flex-shrink-0 flex items-center">
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
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {user.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {user.email}
                                </span>
                            </div>

                            {/* Botão de Sair */}
                            <button
                                onClick={logout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                title="Sair da conta"
                            >
                                <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                    ></path>
                                </svg>
                                Sair
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
