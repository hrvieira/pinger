import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "./page";

// 1. Mock do useRouter (Next.js)
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

// 2. Mock do Link (Next.js)
jest.mock("next/link", () => {
    return ({ children }: { children: React.ReactNode }) => {
        return <a>{children}</a>;
    };
});

// 3. Mock do Contexto de Autenticação
// Simulamos apenas a função login que a página usa
const mockLogin = jest.fn();
jest.mock("@/context/AuthContext", () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

// 4. Mock do Fetch Global
global.fetch = jest.fn();

describe("LoginPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve renderizar o formulário de login", () => {
        render(<LoginPage />);

        expect(
            screen.getByRole("heading", { name: /pinger login/i }),
        ).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("seu@email.com"),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /entrar/i }),
        ).toBeInTheDocument();
    });

    it("deve exibir mensagem de erro se a API falhar", async () => {
        // Simula uma resposta de erro da API
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Credenciais inválidas" }),
        });

        render(<LoginPage />);

        // Preenche o formulário
        fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
            target: { value: "teste@email.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "senhaerrada" },
        });

        // Clica em entrar
        fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

        // Espera que a mensagem de erro apareça
        await waitFor(() => {
            expect(
                screen.getByText("Credenciais inválidas"),
            ).toBeInTheDocument();
        });
    });

    it("deve chamar a função de login se a API responder com sucesso", async () => {
        // Simula resposta de sucesso
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                access_token: "token-falso",
                user: { name: "Teste" },
            }),
        });

        render(<LoginPage />);

        fireEvent.change(screen.getByPlaceholderText("seu@email.com"), {
            target: { value: "user@email.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /entrar/i }));

        await waitFor(() => {
            // Verifica se o fetch foi chamado com os dados certos
            expect(global.fetch).toHaveBeenCalledWith(
                "http://localhost:3000/auth/login",
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        email: "user@email.com",
                        password: "123456",
                    }),
                }),
            );
            // Verifica se a função login do contexto foi chamada
            expect(mockLogin).toHaveBeenCalledWith("token-falso", {
                name: "Teste",
            });
        });
    });
});
