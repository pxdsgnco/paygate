import { NextResponse } from 'next/server'
import { createUser, findUser, getUserByEmail, updateUserPassword } from '@/lib/users'
import { generateToken, generateResetToken, verifyResetToken } from '@/lib/auth'

export async function POST(request: Request) {
  const { action, ...data } = await request.json()

  switch (action) {
    case 'register':
      try {
        const user = await createUser(data.fullName, data.email, data.password)
        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName } })
      } catch (error) {
        return NextResponse.json({ success: false, error: 'Registration failed' }, { status: 400 })
      }

      case 'login':
        try {
          const user = await findUser(data.email, data.password)
          if (!user) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
          }
          const token = generateToken(user.id)
          return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName: user.fullName }, token })
        } catch (error) {
          console.error('Login error:', error)
          return NextResponse.json({ success: false, error: 'Login failed' }, { status: 500 })
        }

    case 'forgot-password':
      try {
        const user = await getUserByEmail(data.email)
        if (user) {
          const resetToken = await generateResetToken(data.email)
          // In a real application, send an email with the reset link
          console.log(`Reset token for ${data.email}: ${resetToken}`)
        }
        // Always return success to prevent email enumeration
        return NextResponse.json({ success: true })
      } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to process request' }, { status: 400 })
      }

    case 'reset-password':
      try {
        const isValid = await verifyResetToken(data.email, data.token)
        if (!isValid) {
          return NextResponse.json({ success: false, error: 'Invalid or expired reset token' }, { status: 400 })
        }
        await updateUserPassword(data.email, data.newPassword)
        return NextResponse.json({ success: true })
      } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to reset password' }, { status: 400 })
      }

    default:
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  }
}