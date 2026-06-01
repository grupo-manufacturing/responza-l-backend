import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import {
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogById,
  listAdminBlogs,
  publishAdminBlog,
  updateAdminBlog,
} from '../services/adminBlogs.service.js'

const contentSchema = z.array(z.string())

const createBlogSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1),
  readTime: z.string().min(1),
  content: contentSchema.default([]),
  published: z.boolean().optional(),
})

const updateBlogSchema = z
  .object({
    slug: z.string().min(1).optional(),
    title: z.string().min(1).optional(),
    excerpt: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    readTime: z.string().min(1).optional(),
    content: contentSchema.optional(),
    published: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'No fields to update.' })

function routeId(req: Request): string | null {
  const id = req.params.id
  return typeof id === 'string' && id.length > 0 ? id : null
}

function sendServiceResult<T>(
  res: Response,
  result: { ok: true; data: T } | { ok: false; error: string; status: number },
  successStatus = 200,
): void {
  if (!result.ok) {
    res.status(result.status).json({ error: result.error })
    return
  }
  res.status(successStatus).json(result.data)
}

export async function getAdminBlogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = await listAdminBlogs()
    res.status(200).json(posts)
  } catch (err) {
    next(err)
  }
}

export async function getAdminBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = routeId(req)
    if (!id) {
      res.status(400).json({ error: 'Invalid id.' })
      return
    }

    const post = await getAdminBlogById(id)
    if (!post) {
      res.status(404).json({ error: 'Not found.' })
      return
    }
    res.status(200).json(post)
  } catch (err) {
    next(err)
  }
}

export async function postAdminBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = createBlogSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body.' })
      return
    }

    const result = await createAdminBlog(parsed.data)
    sendServiceResult(res, result, 201)
  } catch (err) {
    next(err)
  }
}

export async function putAdminBlog(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = updateBlogSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request body.' })
      return
    }

    const id = routeId(req)
    if (!id) {
      res.status(400).json({ error: 'Invalid id.' })
      return
    }

    const result = await updateAdminBlog(id, parsed.data)
    sendServiceResult(res, result)
  } catch (err) {
    next(err)
  }
}

export async function deleteAdminBlogHandler(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = routeId(req)
    if (!id) {
      res.status(400).json({ error: 'Invalid id.' })
      return
    }

    const result = await deleteAdminBlog(id)
    if (!result.ok) {
      res.status(result.status).json({ error: result.error })
      return
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    next(err)
  }
}

export async function patchPublishAdminBlog(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const id = routeId(req)
    if (!id) {
      res.status(400).json({ error: 'Invalid id.' })
      return
    }

    const result = await publishAdminBlog(id)
    sendServiceResult(res, result)
  } catch (err) {
    next(err)
  }
}
