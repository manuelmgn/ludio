import { auth, signOut } from "@/auth"
import { DashboardClient } from "./DashboardClient"

export default async function DashboardPage() {
  const session = await auth()

  const handleSignOut = async () => {
    "use server"
    await signOut({ redirectTo: "/login" })
  }

  return <DashboardClient user={session?.user} signOutAction={handleSignOut} />
}
