"use client";

import { useState, useEffect } from "react";
import { useMonitors, Monitor } from "@/hooks/useMonitors";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { DeleteModal } from "@/components/DeleteModal";

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    // Protege a rota: Se não estiver logado, manda pro login
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    const {
        monitors,
        loading: monitorsLoading,
        addMonitor,
        updateMonitor,
        deleteMonitor,
    } = useMonitors();

    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);

    // Estados do Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [monitorToDelete, setMonitorToDelete] = useState<number | null>(null);

    // Enquanto verifica a autenticação, mostra carregando
    if (isLoading || !isAuthenticated) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <p className="text-gray-500">Carregando acesso...</p>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !url) return;

        if (editingId) {
            await updateMonitor(editingId, name, url);
            setEditingId(null);
        } else {
            await addMonitor(name, url);
        }
        setName("");
        setUrl("");
    };

    const handleEditClick = (monitor: Monitor) => {
        setName(monitor.name);
        setUrl(monitor.url);
        setEditingId(monitor.id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setName("");
        setUrl("");
        setEditingId(null);
    };

    const openDeleteModal = (id: number) => {
        setMonitorToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setMonitorToDelete(null);
        setIsDeleteModalOpen(false);
    };

    const confirmDelete = async () => {
        if (monitorToDelete) {
            await deleteMonitor(monitorToDelete);
            closeDeleteModal();
        }
    };

    return (
        // Padding ajustado (py-8 em vez de p-10) para balancear com o Header
        <div className="max-w-3xl mx-auto py-8 px-4 font-sans text-gray-800 dark:text-gray-100 relative">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Dashboard</h2>
                <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Ao vivo
                </span>
            </div>

            <form
                onSubmit={handleSubmit}
                className={`mb-8 p-6 rounded-lg transition-all shadow-sm ${
                    editingId
                        ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-white border border-gray-200 dark:bg-gray-900 dark:border-gray-800"
                }`}
            >
                <h3
                    className={`mb-4 font-semibold ${
                        editingId ? "text-blue-600 dark:text-blue-400" : ""
                    }`}
                >
                    {editingId
                        ? "✏️ Editando Monitor"
                        : "➕ Adicionar Novo Site"}
                </h3>

                <div className="flex gap-3 flex-wrap">
                    <input
                        className="flex-1 p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-blue-500 transition"
                        placeholder="Nome (ex: UOL)"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <input
                        className="flex-[2] p-3 rounded border border-gray-300 dark:border-gray-700 dark:bg-gray-800 outline-none focus:border-blue-500 transition"
                        placeholder="URL (ex: https://uol.com.br)"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />

                    <button
                        type="submit"
                        className={`px-6 py-3 text-white rounded font-bold cursor-pointer transition hover:opacity-90 ${
                            editingId ? "bg-blue-600" : "bg-blue-600"
                        }`}
                    >
                        {editingId ? "Salvar" : "Adicionar"}
                    </button>

                    {editingId && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-3 bg-gray-400 text-white rounded hover:bg-gray-500 transition"
                        >
                            Cancelar
                        </button>
                    )}
                </div>
            </form>

            {monitorsLoading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <ul className="space-y-4">
                    {monitors.map((m) => (
                        <li
                            key={m.id}
                            className="border border-gray-200 dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1">
                                <strong className="text-lg block mb-1">
                                    {m.name}
                                </strong>
                                <a
                                    href={m.url}
                                    target="_blank"
                                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline break-all flex items-center gap-1"
                                >
                                    {m.url}
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                        ></path>
                                    </svg>
                                </a>
                                {m.lastChecked && (
                                    <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                            ></path>
                                        </svg>
                                        Checado às{" "}
                                        {new Date(
                                            m.lastChecked,
                                        ).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border flex items-center gap-1.5 ${
                                        m.status === "up"
                                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                                            : m.status === "pending"
                                              ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900"
                                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                                    }`}
                                >
                                    <span
                                        className={`w-2 h-2 rounded-full ${
                                            m.status === "up"
                                                ? "bg-green-500"
                                                : m.status === "pending"
                                                  ? "bg-yellow-500"
                                                  : "bg-red-500"
                                        }`}
                                    ></span>
                                    {m.status === "up"
                                        ? "ONLINE"
                                        : m.status === "pending"
                                          ? "AGUARDE"
                                          : "OFFLINE"}
                                </span>

                                <div className="flex gap-1 border-l border-gray-200 dark:border-gray-700 pl-3 ml-1">
                                    <button
                                        onClick={() => handleEditClick(m)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full transition"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(m.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition"
                                        title="Excluir"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={confirmDelete}
            />
        </div>
    );
}
