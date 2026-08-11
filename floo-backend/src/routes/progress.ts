import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth, AuthRequest } from '../middleware/auth'
import type { Response } from 'express'

const router = Router()

// 所有进度接口都需要登录
router.use(requireAuth)

// GET /api/progress - 拉取云端进度
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.progress.findUnique({
      where: { userId: req.userId! },
    })

    if (!progress) {
      // 新用户还没有进度记录，返回空状态
      res.json({
        fireplaces: [],
        inventory: [],
        flags: {},
        variables: {},
        gameState: {},
        updatedAt: null,
      })
      return
    }

    res.json(progress)
  } catch (err) {
    console.error('[progress GET]', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// PUT /api/progress - 上传本地进度到云端（整体覆盖）
router.put('/', async (req: AuthRequest, res: Response) => {
  const { fireplaces, inventory, flags, variables, gameState } = req.body as {
    fireplaces?: unknown
    inventory?: unknown
    flags?: unknown
    variables?: unknown
    gameState?: unknown
  }

  try {
    const progress = await prisma.progress.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        fireplaces: fireplaces ?? [],
        inventory: inventory ?? [],
        flags: flags ?? {},
        variables: variables ?? {},
        gameState: gameState ?? {},
      },
      update: {
        fireplaces: fireplaces ?? [],
        inventory: inventory ?? [],
        flags: flags ?? {},
        variables: variables ?? {},
        gameState: gameState ?? {},
      },
    })

    res.json({ ok: true, updatedAt: progress.updatedAt })
  } catch (err) {
    console.error('[progress PUT]', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

export default router
