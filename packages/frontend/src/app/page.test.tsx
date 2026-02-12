import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Home from "./page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

const mockUseAuth = jest.fn();
jest.mock("@/context/AuthContext", () => ({
    useAuth: () => mockUseAuth(),
}));

const mockAddMonitor = jest.fn();
const mockUpdateMonitor = jest.fn();
const mockDeleteMonitor = jest.fn();
const mockUseMonitors = jest.fn();

jest.mock("@/hooks/useMonitors", () => ({
    useMonitors: () => mockUseMonitors(),
}));

describe("Dashboard Page (Home)", () => {
    beforeEach(() => {
        jest.clearAllMocks();

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

    it("deve redirecionar para login se o usuário NÃO estiver autenticado", () => {
        mockUseAuth.mockReturnValue({
            isAuthenticated: false,
            isLoading: false,
        });

        render(<Home />);

        expect(mockPush).toHaveBeenCalledWith("/login");
    });

    it("deve renderizar a lista de monitores corretamente", () => {
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
        expect(screen.getByText("ONLINE")).toBeInTheDocument();
        expect(screen.getByText("OFFLINE")).toBeInTheDocument();
    });

    it("deve chamar addMonitor ao submeter o formulário", async () => {
        render(<Home />);

        const nameInput = screen.getByPlaceholderText(/Nome \(ex: UOL\)/i);
        const urlInput = screen.getByPlaceholderText(/URL/i);
        const addButton = screen.getByRole("button", { name: /Adicionar/i });

        fireEvent.change(nameInput, { target: { value: "Novo Site" } });
        fireEvent.change(urlInput, {
            target: { value: "https://novosite.com" },
        });

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

        const editButton = screen.getByTitle("Editar");
        fireEvent.click(editButton);

        expect(
            screen.getByDisplayValue("Site Para Editar"),
        ).toBeInTheDocument();
        expect(
            screen.getByDisplayValue("https://edit.com"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /Salvar/i }),
        ).toBeInTheDocument();
    });

    it("deve chamar updateMonitor ao salvar uma edição", async () => {
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

        fireEvent.click(screen.getByTitle("Editar"));

        const nameInput = screen.getByDisplayValue("Site Antigo");
        fireEvent.change(nameInput, { target: { value: "Site Novo" } });

        fireEvent.click(screen.getByRole("button", { name: /Salvar/i }));

        await waitFor(() => {
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

        fireEvent.click(screen.getByTitle("Excluir"));

        expect(
            screen.getByText(/Are you sure you want to deactivate/i),
        ).toBeInTheDocument();

        fireEvent.click(screen.getByText("Deactivate"));

        await waitFor(() => {
            expect(mockDeleteMonitor).toHaveBeenCalledWith(99);
        });
    });
});
