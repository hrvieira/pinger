import { render, screen, fireEvent } from "@testing-library/react";
import { Header } from "./Header";

// Mock do Contexto de Autenticação
const mockLogout = jest.fn();
let mockUser: { name: string; email: string } | null = null;

jest.mock("@/context/AuthContext", () => ({
    useAuth: () => ({
        user: mockUser,
        logout: mockLogout,
    }),
}));

// Mock do Link
jest.mock("next/link", () => {
    return ({
        children,
        href,
    }: {
        children: React.ReactNode;
        href: string;
    }) => {
        return <a href={href}>{children}</a>;
    };
});

// Mock do useRouter
jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: jest.fn() }),
}));

describe("Header Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUser = null;
    });

    it("deve renderizar o logo do Pinger", () => {
        render(<Header />);
        expect(screen.getByText(/pinger/i)).toBeInTheDocument();
    });

    it("deve mostrar o nome do usuário e botão de sair quando logado", () => {
        mockUser = { name: "Admin User", email: "admin@pinger.com" };

        render(<Header />);

        expect(screen.getByText("Admin User")).toBeInTheDocument();
        // CORREÇÃO: Usamos getByTitle porque o texto está no atributo title, não visível
        expect(screen.getByTitle(/sair/i)).toBeInTheDocument();
    });

    it("deve chamar a função logout ao clicar em sair", () => {
        mockUser = { name: "Admin User", email: "admin@pinger.com" };

        render(<Header />);

        // CORREÇÃO: Usamos getByTitle aqui também
        const logoutButton = screen.getByTitle(/sair/i);
        fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it("NÃO deve mostrar informações de usuário se não estiver logado", () => {
        mockUser = null;

        render(<Header />);

        expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
        expect(screen.queryByTitle(/sair/i)).not.toBeInTheDocument();
    });
});
