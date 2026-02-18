import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import laravel from "laravel-vite-plugin";
import { resolve } from "node:path";

export default defineConfig({
    plugins: [
        laravel({
            input: [
                "resources/js/app.ts",
                "resources/js/pages/Auth/Login/index.ts",
                "resources/js/pages/Auth/Register/index.ts",
                "resources/js/pages/Home/index.ts",
                "resources/js/pages/Tasks/Index/index.ts"
            ],
            refresh: true,
            ssr: false,
        }),
        tailwindcss(),
    ],
    build: {
        sourcemap: true,
        chunkSizeWarningLimit: 500,
        emptyOutDir: false,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['jquery', 'underscore', 'backbone'],
                    utils: ['@inertiajs/inertia', '@inertiajs/progress'],
                },
            },
        },
    },
    resolve: {
        alias: {
            jquery: "jquery",
            "ziggy-js": resolve(__dirname, "vendor/tightenco/ziggy"),
            "@/": resolve(__dirname, "resources/js"),
            "src/": resolve(__dirname, "resources/js"),
            'Qs': 'qs'
        },
    },
    server: {
        hmr: {
            overlay: false,
        },
    },
    optimizeDeps: {
        include: ['jquery', 'underscore', 'backbone', 'Qs'],
    },
});
