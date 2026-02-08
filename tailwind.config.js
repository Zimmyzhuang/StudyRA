/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "Inter",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "sans-serif",
        ],
      },
      colors: {
        notion: {
          bg: "#ffffff",
          sidebar: "#f7f7f5",
          "sidebar-hover": "#efefed",
          "sidebar-active": "#e8e8e6",
          text: "#37352f",
          "text-secondary": "#787774",
          "text-tertiary": "#b4b4b0",
          border: "#e8e8e5",
          accent: "#2383e2",
        },
      },
      lineHeight: {
        relaxed: "1.6",
      },
    },
  },
  plugins: [],
};
