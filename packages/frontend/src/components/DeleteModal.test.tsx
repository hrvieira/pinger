import { render, screen, fireEvent } from "@testing-library/react";
import { DeleteModal } from "./DeleteModal";

describe("DeleteModal Component", () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    it("não deve renderizar nada se isOpen for false", () => {
        render(
            <DeleteModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
        );
        const modalTitle = screen.queryByText(/Deactivate monitor/i);
        expect(modalTitle).not.toBeInTheDocument();
    });

    it("deve renderizar corretamente quando isOpen for true", () => {
        render(
            <DeleteModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
        );

        expect(screen.getByText(/Deactivate monitor/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Are you sure you want to deactivate/i),
        ).toBeInTheDocument();
    });

    it("deve chamar onClose ao clicar em Cancelar", () => {
        render(
            <DeleteModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
        );

        const cancelButton = screen.getByText("Cancel");
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("deve chamar onConfirm ao clicar em Deactivate", () => {
        render(
            <DeleteModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
            />,
        );

        const confirmButton = screen.getByText("Deactivate");
        fireEvent.click(confirmButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
    });
});
