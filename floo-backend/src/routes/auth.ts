import { Router } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { prisma } from '../lib/prisma'

const router = Router()
const SALT_ROUNDS = 12

function signToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '30d' })
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: '邮箱和密码不能为空' })
    return
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: '邮箱格式不正确' })
    return
  }
  if (password.length < 6) {
    res.status(400).json({ error: '密码至少 6 位' })
    return
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      res.status(409).json({ error: '该邮箱已注册' })
      return
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await prisma.user.create({ data: { email, passwordHash } })

    const token = signToken(user.id)
    res.status(201).json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error('[register]', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }

  if (!email || !password) {
    res.status(400).json({ error: '邮箱和密码不能为空' })
    return
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      // 故意模糊错误信息，防止枚举账号
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      res.status(401).json({ error: '邮箱或密码错误' })
      return
    }

    const token = signToken(user.id)
    res.json({ token, user: { id: user.id, email: user.email } })
  } catch (err) {
    console.error('[login]', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

export default router
