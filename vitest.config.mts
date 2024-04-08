import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        root: path.join(process.cwd(), 'test'),
        environment: 'jsdom',
        setupFiles: [
            path.join(process.cwd(), 'test', 'setup.ts')
        ],
        testTimeout: 10_000
    }
})