import { useState, useEffect } from "react";

export interface Monitor {
    id: number;
    name: string;
    url: string;
    status: string;
    isActive: boolean;
    lastChecked: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3000";
const API_URL = `${API_BASE}/monitors`;

export function useMonitors() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);

    const getAuthHeader = () => {
        // TODO: Migrar para Cookies/Context para maior segurança
        const token = localStorage.getItem("pinger_token");

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        return headers;
    };

    const fetchMonitors = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            // Garante que é um array antes de setar
            if (Array.isArray(data)) {
                setMonitors(data);
            } else {
                setMonitors([]);
            }
            setLoading(false);
        } catch (error) {
            console.error("Erro ao buscar:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonitors();
        // Atualiza a cada 60 segundos
        const interval = setInterval(fetchMonitors, 60000);
        return () => clearInterval(interval);
    }, []);

    const addMonitor = async (name: string, url: string) => {
        await fetch(API_URL, {
            method: "POST",
            headers: getAuthHeader(),
            body: JSON.stringify({ name, url }),
        });
        fetchMonitors();
    };

    const updateMonitor = async (id: number, name: string, url: string) => {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: getAuthHeader(),
            body: JSON.stringify({ name, url }),
        });
        fetchMonitors();
    };

    const deleteMonitor = async (id: number) => {
        await fetch(`${API_URL}/${id}`, {
            method: "DELETE",
            headers: getAuthHeader(),
        });
        fetchMonitors();
    };

    return { monitors, loading, addMonitor, updateMonitor, deleteMonitor };
}
