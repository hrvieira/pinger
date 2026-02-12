import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RegisterPage from "./page";

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush }),
}));

jest.mock("next/link", () => {
    return ({ children }: { children: React.ReactNode }) => {
        return <a>{children}</a>;
    };
});

global.fetch = jest.fn();

describe("RegisterPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("deve renderizar o formulário de cadastro corretamente", () => {
        render(<RegisterPage />);

        expect(
            screen.getByRole("heading", { name: /criar conta/i }),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Seu Nome")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("seu@outlook.com"),
        ).toBeInTheDocument();
        expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: /cadastrar/i }),
        ).toBeInTheDocument();
    });

    it("deve exibir erro se a API falhar", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: "Email já está em uso" }),
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText("Seu Nome"), {
            target: { value: "Novo Usuário" },
        });
        fireEvent.change(screen.getByPlaceholderText("seu@outlook.com"), {
            target: { value: "existente@email.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

        await waitFor(() => {
            expect(
                screen.getByText("Email já está em uso"),
            ).toBeInTheDocument();
        });
    });

    it("deve redirecionar para login após sucesso", async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 1, name: "Novo Usuário" }),
        });

        render(<RegisterPage />);

        fireEvent.change(screen.getByPlaceholderText("Seu Nome"), {
            target: { value: "Sucesso" },
        });
        fireEvent.change(screen.getByPlaceholderText("seu@outlook.com"), {
            target: { value: "novo@email.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("••••••••"), {
            target: { value: "123456" },
        });

        fireEvent.click(screen.getByRole("button", { name: /cadastrar/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining("/auth/register"),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({
                        name: "Sucesso",
                        email: "novo@email.com",
                        password: "123456",
                    }),
                }),
            );
            expect(mockPush).toHaveBeenCalledWith("/login");
        });
    });
});
