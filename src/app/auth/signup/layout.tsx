import { redirectIfAuthenticated } from "@/lib/auth/guard-dashboard";

export default async function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await redirectIfAuthenticated();
  return children;
}
