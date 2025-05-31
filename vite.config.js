import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src", // this will resolve '@' to your src directory
    },
  },
   server: {
    host: '0.0.0.0',
    port: 5173, // or any port
  },
});


