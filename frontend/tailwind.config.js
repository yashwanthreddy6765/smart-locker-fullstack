/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#17202a",
        mist: "#f4f7f8",
        teal: "#0f766e",
        coral: "#e76f51",
      },
      boxShadow: {
        panel: "0 12px 30px rgba(23, 32, 42, 0.08)",
      },
    },
  },
  plugins: [],
};

