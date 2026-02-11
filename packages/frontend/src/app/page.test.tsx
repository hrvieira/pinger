import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

// --- MOCKS ---

// 1. Mock do Next.js Navigation
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

// 2. Mock do AuthContext
const mockUseAuth = jest.fn();
jest.mock("@/context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

// 3. Mock do useMonitors
const mockAddMonitor = jest.fn();
const mockUpdateMonitor = jest.fn();
const mockDeleteMonitor = jest.fn();
const mockUseMonitors = jest.fn(); // Função principal que o componente chama

jest.mock("@/hooks/useMonitors", () => ({
    useMonitors: () => mockUseMonitors(),
}));

// --- CONFIGURAÇÃO GLOBAL DOS TESTES ---
describe("Dashboard Page (Home)", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Configuração Padrão: Usuário Logado e Sem Monitores
        mockUseAuth.mockReturnValue({
            isAuthenticated: true,
            isLoading: false,
        });

        mockUseMonitors.mockReturnValue({
            monitors: [],
            loading: false,
            addMonitor: mockAddMonitor,
            updateMonitor: mockUpdateMonitor,
            deleteMonitor: mockDeleteMonitor,
        });
    });

    // --- TESTES ---

    it("deve redirecionar para login se o usuário NÃO estiver autenticado", () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
        });

        render(<Home />);

        expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("deve renderizar a lista de monitores corretamente", () => {
        // Simula que o hook retornou dados
        mockUseMonitors.mockReturnValue({
            monitors: [
                {
                    id: 1,
                    name: "Google",
                    url: "https://google.com",
                    status: "up",
                    lastChecked: new Date().toISOString(),
                },
                {
                    id: 2,
                    name: "Sistema Interno",
                    url: "http://localhost:8080",
                    status: "down",
                    lastChecked: null,
                },
            ],
            loading: false,
            addMonitor: mockAddMonitor,
            updateMonitor: mockUpdateMonitor,
            deleteMonitor: mockDeleteMonitor,
        });

        render(<Home />);

        expect(screen.getByText("Google")).toBeInTheDocument();
        expect(screen.getByText("Sistema Interno")).toBeInTheDocument();
        expect(screen.getByText("ONLINE")).toBeInTheDocument(); // Status UP
        expect(screen.getByText("OFFLINE")).toBeInTheDocument(); // Status DOWN
    });

    it("deve chamar addMonitor ao submeter o formulário", async () => {
        render(<Home />);

        const nameInput = screen.getByPlaceholderText(/Nome \(ex: UOL\)/i);
        const urlInput = screen.getByPlaceholderText(/URL/i);
        const addButton = screen.getByRole("button", { name: /Adicionar/i });

        // Preenche os campos
        fireEvent.change(nameInput, { target: { value: "Novo Site" } });
        fireEvent.change(urlInput, {
            target: { value: "https://novosite.com" },
        });

        // Clica em adicionar
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(mockAddMonitor).toHaveBeenCalledWith(
                "Novo Site",
                "https://novosite.com",
            );
        });
    });

    it('deve preencher o formulário e mudar botão para "Salvar" ao clicar em Editar', () => {
        mockUseMonitors.mockReturnValue({
            monitors: [
                {
                    id: 10,
                    name: "Site Para Editar",
                    url: "https://edit.com",
                    status: "up",
                },
            ],
            loading: false,
            addMonitor: mockAddMonitor,
            updateMonitor: mockUpdateMonitor,
            deleteMonitor: mockDeleteMonitor,
        });

        render(<Home />);

        // Clica no botão de lápis (title="Editar")
        const editButton = screen.getByTitle("Editar");
        fireEvent.click(editButton);

        // Verifica se os inputs receberam os valores
        expect(
            screen.getByDisplayValue("Site Para Editar"),
        ).toBeInTheDocument();
        expect(
            screen.getByDisplayValue("https://edit.com"),
        ).toBeInTheDocument();

        // Verifica se o botão mudou de texto
        expect(
            screen.getByRole("button", { name: /Salvar/i }),
        ).toBeInTheDocument();
    });

    it("deve chamar updateMonitor ao salvar uma edição", async () => {
        // Setup inicial com um monitor
        mockUseMonitors.mockReturnValue({
            monitors: [
                {
                    id: 10,
                    name: "Site Antigo",
                    url: "https://antigo.com",
                    status: "up",
                },
            ],
            loading: false,
            addMonitor: mockAddMonitor,
            updateMonitor: mockUpdateMonitor,
            deleteMonitor: mockDeleteMonitor,
        });

        render(<Home />);

        // 1. Entra no modo de edição
        fireEvent.click(screen.getByTitle("Editar"));

        // 2. Altera os valores
        const nameInput = screen.getByDisplayValue("Site Antigo");
        fireEvent.change(nameInput, { target: { value: "Site Novo" } });

        // 3. Salva
        fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

        await waitFor(() => {
            // Verifica se chamou update com ID correto e novos dados
            expect(mockUpdateMonitor).toHaveBeenCalledWith(
                10,
                "Site Novo",
                "https://antigo.com",
            );
        });
    });

    it("deve abrir o modal e deletar o monitor ao confirmar", async () => {
        mockUseMonitors.mockReturnValue({
            monitors: [
                {
                    id: 99,
                    name: "Site Lixo",
                    url: "https://lixo.com",
                    status: "down",
                },
            ],
            loading: false,
            addMonitor: mockAddMonitor,
            updateMonitor: mockUpdateMonitor,
            deleteMonitor: mockDeleteMonitor,
        });

        render(<Home />);

        // 1. Clica na lixeira
        fireEvent.click(screen.getByTitle("Excluir"));

        // 2. Verifica se o modal apareceu (texto do modal)
        expect(
            screen.getByText(/Are you sure you want to deactivate/i),
        ).toBeInTheDocument();

        // 3. Clica no botão de confirmar do modal (texto do seu botão no DeleteModal)
        fireEvent.click(screen.getByText("Deactivate"));

        await waitFor(() => {
            expect(mockDeleteMonitor).toHaveBeenCalledWith(99);
        });
    });
});
