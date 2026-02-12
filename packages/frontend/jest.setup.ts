import "@testing-library/jest-dom";

// O JSDOM não implementa window.scrollTo nativamente
global.scrollTo = jest.fn();
