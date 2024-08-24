import { prisma } from './prisma'
import { hashPassword, verifyPassword, generateToken, verifyResetToken } from './auth'

export async function createUser(fullName: string, email: string, password: string) {
  const hashedPassword = await hashPassword(password)
  return prisma.user.create({
    data: { fullName, email, hashedPassword }
  })
}

export async function findUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return null
  const isValid = await verifyPassword(password, user.hashedPassword)
  if (!isValid) return null
  return { id: user.id, email: user.email, fullName: user.fullName }
}

export async function updateUserPassword(email: string, newPassword: string) {
  const hashedPassword = await hashPassword(newPassword)
  return prisma.user.update({
    where: { email },
    data: { hashedPassword, resetToken: null, resetTokenExpires: null }
  })
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}