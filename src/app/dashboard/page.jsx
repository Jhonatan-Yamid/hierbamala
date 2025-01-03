"use client"
import {signOut, useSession} from 'next-auth/react'

function DashboardPage() {
  const {data: session} = useSession()
  return (
    <section className="h-[calc(100vh-7rem)] flex justify-center items-center">
      <div>
        <h1 className="text-white text-5xl">Bienvenido {session?.user?.name} y {session?.user?.image} y {session?.user?.image !== 1 ? "true" : "false"} </h1>
        {/* <button className="bg-white text-black px-4 py-2 rounded-md mt-4"
          onClick={() => signOut()}
        >
          Logout
        </button> */}
      </div>
    </section>
  )
}
export default DashboardPage