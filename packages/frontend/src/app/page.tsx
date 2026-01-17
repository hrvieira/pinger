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
        <div className="max-w-3xl mx-auto p-10 font-sans text-gray-800 dark:text-gray-100 relative">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Meus Monitores (Pinger)</h1>
                <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-800 px-3 py-1 rounded-full">
                    Atualizando a cada 60s...
                </span>
            </div>

            <form
                onSubmit={handleSubmit}
                className={`mb-8 p-6 rounded-lg transition-all ${
                    editingId
                        ? "bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                        : "bg-gray-100 dark:bg-gray-900"
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
                <p className="text-center text-gray-500">Carregando...</p>
            ) : (
                <ul className="space-y-4">
                    {monitors.map((m) => (
                        <li
                            key={m.id}
                            className="border border-gray-200 dark:border-gray-800 p-4 rounded-lg bg-white dark:bg-neutral-900 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                        >
                            <div className="flex-1">
                                <strong className="text-lg block mb-1">
                                    {m.name}
                                </strong>
                                <a
                                    href={m.url}
                                    target="_blank"
                                    className="text-blue-600 dark:text-blue-400 text-sm hover:underline break-all"
                                >
                                    {m.url}
                                </a>
                                {m.lastChecked && (
                                    <div className="text-xs text-gray-400 mt-1">
                                        Última checagem:{" "}
                                        {new Date(
                                            m.lastChecked
                                        ).toLocaleTimeString()}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                        m.status === "up"
                                            ? "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900"
                                            : m.status === "pending"
                                            ? "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900"
                                            : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900"
                                    }`}
                                >
                                    {m.status === "up"
                                        ? "ONLINE 🟢"
                                        : m.status === "pending"
                                        ? "..."
                                        : "OFFLINE 🔴"}
                                </span>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditClick(m)}
                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition"
                                        title="Editar"
                                    >
                                        ✏️
                                    </button>

                                    <button
                                        onClick={() => openDeleteModal(m.id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition"
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
