"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage({ text: "", type: "" });

        try {
            const res = await fetch("http://localhost:3000/auth/password", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await res.json();

            if (!res.ok)
                throw new Error(data.message || "Erro ao atualizar a senha.");

            setMessage({
                text: "Senha atualizada com sucesso!",
                type: "success",
            });
            setCurrentPassword("");
            setNewPassword("");
        } catch (err: any) {
            setMessage({
                text: err.message || "Erro ao atualizar a senha.",
                type: "error",
            });
        }
    };

    if (!user) return <p>Carregando perfil...</p>;

    return (
        <div className="max-w-2xl mx-auto p-8 font-sans text-gray-800 dark:text-gray-100">
            <h1 className="text-3xl font-bold mb-8">Minha Conta</h1>

            {/* Cartão de Informações */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.name}</h2>
                        <p className="text-gray-500 dark:text-gray-400">
                            {user.email}
                        </p>
                        <span className="text-xs uppercase font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300 mt-1 inline-block">
                            {user.role}
                        </span>
                    </div>
                </div>
            </div>

            {/* Formulário de Troca de Senha */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                    Alterar Senha
                </h3>

                {message.text && (
                    <div
                        className={`p-4 mb-4 text-sm rounded-lg ${
                            message.type === "success"
                                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="block text-sm font-medium mb-1"
                        >
                            Senha Atual
                        </label>
                        <input
                            id="currentPassword"
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            required
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="newPassword"
                            className="block text-sm font-medium mb-1"
                        >
                            Nova Senha
                        </label>
                        <input
                            id="newPassword"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium"
                    >
                        Atualizar Senha
                    </button>
                </form>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <button
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
                >
                    <svg
                        className="w-5 h-5"
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
                    Sair da Conta
                </button>
            </div>
        </div>
    );
}
