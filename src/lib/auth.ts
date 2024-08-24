import { compare, hash } from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

export function generateToken(userId: number): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: '1d' })
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return verify(token, JWT_SECRET) as { userId: number }
  } catch {
    return null
  }
}

export async function generateResetToken(email: string): Promise<string> {
  const token = Math.random().toString(36).substr(2, 10)
  const expires = new Date(Date.now() + 3600000) // 1 hour from now

  await prisma.user.update({
    where: { email },
    data: { resetToken: token, resetTokenExpires: expires }
  })

  return token
}

export async function verifyResetToken(email: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || user.resetToken !== token || !user.resetTokenExpires) {
    return false
  }

  return user.resetTokenExpires > new Date()
}