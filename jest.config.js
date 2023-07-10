export default {
    extensionsToTreatAsEsm: ['.ts', '.tsx'],
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.(t|j)sx?$': ['ts-jest', { useESM: true }],
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.(j|t)sx?$': '$1',
    },
    roots: ['<rootDir>/src/'],
};
