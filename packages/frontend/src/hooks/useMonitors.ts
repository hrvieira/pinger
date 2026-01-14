import { useState, useEffect } from "react";

export interface Monitor {
    id: number;
    name: string;
    url: string;
    status: string;
    isActive: boolean;
    lastChecked: string;
}

const API_URL = "http://127.0.0.1:3000/monitors";

export function useMonitors() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);

    // Função interna para buscar dados
    const fetchMonitors = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setMonitors(data);
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar:", error);
        }
    };

    // Poll de atualização (1min)
    useEffect(() => {
        fetchMonitors();
        const interval = setInterval(fetchMonitors, 60000);
        return () => clearInterval(interval);
    }, []);

    // Ações CRUD
    const addMonitor = async (name: string, url: string) => {
        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url }),
        });
        fetchMonitors();
    };

    const updateMonitor = async (id: number, name: string, url: string) => {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url }),
        });
        fetchMonitors();
    };

    const deleteMonitor = async (id: number) => {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        fetchMonitors();
    };

    return { monitors, loading, addMonitor, updateMonitor, deleteMonitor };
}
