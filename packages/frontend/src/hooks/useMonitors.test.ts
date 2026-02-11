import { renderHook, act, waitFor } from "@testing-library/react";
import { useMonitors } from "./useMonitors";

// Mock do fetch global
global.fetch = jest.fn();

describe("useMonitors Hook", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Limpa o localStorage antes de cada teste
        localStorage.clear();
    });

    it("deve buscar monitores ao inicializar", async () => {
        const mockMonitors = [
            { id: 1, name: "Google", url: "https://google.com", status: "up" },
        ];

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockMonitors,
        });

        const { result } = renderHook(() => useMonitors());

        // Estado inicial
        expect(result.current.loading).toBe(true);
        expect(result.current.monitors).toEqual([]);

        // Aguarda a atualização do estado após o fetch
        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.monitors).toEqual(mockMonitors);
        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    it("deve adicionar um monitor com o token de autenticação", async () => {
        // Simula um token no localStorage
        localStorage.setItem("pinger_token", "token-secreto-123");

        // Mock da resposta do GET inicial (para não quebrar o useEffect)
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        // Renderiza o hook
        const { result } = renderHook(() => useMonitors());

        // Aguarda o carregamento inicial
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Prepara o mock para o POST do addMonitor
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        // Prepara o mock para o refetch (chamado logo após adicionar)
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [{ id: 1, name: "Novo", url: "http://novo.com" }],
        });

        // Executa a ação
        await act(async () => {
            await result.current.addMonitor("Novo Site", "http://novo.com");
        });

        // Verifica se o fetch foi chamado corretamente com o token
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/monitors"),
            expect.objectContaining({
                method: "POST",
                headers: expect.objectContaining({
                    Authorization: "Bearer token-secreto-123",
                    "Content-Type": "application/json",
                }),
                body: JSON.stringify({
                    name: "Novo Site",
                    url: "http://novo.com",
                }),
            }),
        );
    });

    it("deve deletar um monitor", async () => {
        localStorage.setItem("pinger_token", "token-secreto-123");

        // Mock inicial
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        const { result } = renderHook(() => useMonitors());
        await waitFor(() => expect(result.current.loading).toBe(false));

        // Mock do DELETE e do refetch subsequente
        (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => [],
        });

        await act(async () => {
            await result.current.deleteMonitor(99);
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining("/monitors/99"),
            expect.objectContaining({
                method: "DELETE",
                headers: expect.objectContaining({
                    Authorization: "Bearer token-secreto-123",
                }),
            }),
        );
    });
});
