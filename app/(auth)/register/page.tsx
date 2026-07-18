/**
 * /register — same flow as /login for now.
 * After OTP verify, new users are routed to /onboarding automatically.
 */
import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/login");
}
