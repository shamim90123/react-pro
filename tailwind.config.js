// tailwind.config.js
export default {
    darkMode: ['class', '[data-theme="dark"]'],
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
        colors: {
            primary: "var(--color-primary)",
            background: "var(--color-background)",
            text: "var(--color-text)",
        },
        },
    },
    plugins: [],
};
