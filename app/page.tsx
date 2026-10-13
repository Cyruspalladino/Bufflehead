import Link from 'next/link'

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 text-center">
      <h1 className="text-5xl font-bold">Bufflehead</h1>
      <p className="mt-4 text-lg text-gray-500">
        Hi:)
      </p>
      <div className="mt-10 flex justify-center gap-4">
        <Link
          href="/signup"
          className="rounded-lg bg-black px-6 py-3 text-white"
        >
          Sign up
        </Link>
        <Link href="/login" className="rounded-lg border px-6 py-3">
          Log in
        </Link>
      </div>
    </main>
  )
}