import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  server: {
    watch: {
      ignored: ["**/data/**", "**/results.json"]
    }
  }
});
// Allow superuserz.com as an allowed host
export const server = {
  allowedHosts: ["https://www.superuserz.com"],
};