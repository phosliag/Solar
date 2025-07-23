import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const host = process.env.VITE_HOST_IP || "localhost";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: "client",
  server: {
    // host,
    // port: 5173,
    // strictPort: true,
    proxy: { "/api": `http://${host}:5000` },
  },
});
