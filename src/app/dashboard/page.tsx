'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"

interface User {
  id: number;
  fullName: string;
  email: string;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Fetch user data
    fetch('/api/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      return res.json()
    })
    .then(data => {
      if (data.success) {
        setUser(data.user)
      } else {
        throw new Error(data.error || 'Failed to fetch user data')
      }
    })
    .catch(err => {
      console.error('Failed to fetch user data', err)
      setError(err.message)
      // Optionally, redirect to login if there's an authentication error
      if (err.message.includes('401')) {
        localStorage.removeItem('token')
        router.push('/login')
      }
    })
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/login')
  }

  if (error) {
    return <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Error</h1>
      <p className="mb-8">{error}</p>
      <Button onClick={() => router.push('/login')}>Back to Login</Button>
    </main>
  }

  if (!user) {
    return <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">No user data found</h1>
      <Button onClick={() => router.push('/login')}>Back to Login</Button>
    </main>
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-3xl font-bold mb-8">Welcome, {user.fullName}!</h1>
      <p className="mb-8">You&apos;re logged in as {user.email}</p>
      <Button onClick={handleLogout}>Logout</Button>
    </main>
  )
}