import { auth, signOut } from "@/auth"

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-zinc-950 text-white">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl max-w-lg w-full text-center">
        <h1 className="text-3xl font-bold mb-2">¡Bienvenido a Ludio!</h1>
        <p className="text-zinc-400 mb-8">
          Has iniciado sesión como <span className="font-semibold text-blue-400">{session?.user?.name}</span> ({session?.user?.email})
        </p>
        
        <form
          action={async () => {
            "use server"
            await signOut({ redirectTo: "/login" })
          }}
        >
          <button type="submit" className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded font-medium text-white transition-colors">
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
