import { AdminLogin } from "@/components/forms/admin-login"
import { authReady } from "@/lib/server/auth"
export const metadata = {
  title: "Admin Sign In",
  robots: { index: false, follow: false },
}
export default function Login() {
  return (
    <div className="form-shell" style={{ maxWidth: 520 }}>
      <AdminLogin ready={authReady()} />
    </div>
  )
}
