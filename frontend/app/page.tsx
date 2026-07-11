import { redirect } from "next/navigation";

export default function Home() {
  // Server-side redirect to the dashboard (root has no useful content)
  redirect("/dashboard");
}
