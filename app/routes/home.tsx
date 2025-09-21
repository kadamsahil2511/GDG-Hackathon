import type { Route } from "./+types/home";
import { ReactorHome } from "../components/ReactorHome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "REACTOR - Real-time Fact Checking" },
    { name: "description", content: "Advanced fact-checking platform with real-time claim detection, source verification, and AI-powered analysis." },
  ];
}

export default function Home() {
  return <ReactorHome />;
}
