import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
    // O caminho para o seu app Next.js para carregar next.config.js e arquivos .env
    dir: "./",
});

const config: Config = {
    coverageProvider: "v8",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
    moduleNameMapper: {
        // Lidar com o alias de importação do TypeScript (@/*)
        "^@/(.*)$": "<rootDir>/src/$1",
    },
};

export default createJestConfig(config);
