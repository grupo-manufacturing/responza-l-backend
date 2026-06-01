import type { Request, Response, NextFunction } from 'express'
import { getPublishedBlogBySlug, listPublishedBlogs } from '../services/blogs.service.js'

export async function getBlogs(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const posts = await listPublishedBlogs()
    res.status(200).json(posts)
  } catch (err) {
    next(err)
  }
}

export async function getBlogBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slug = req.params.slug
    if (!slug || typeof slug !== 'string') {
      res.status(400).json({ error: 'Invalid slug.' })
      return
    }

    const post = await getPublishedBlogBySlug(slug)
    if (!post) {
      res.status(404).json({ error: 'Not found.' })
      return
    }

    res.status(200).json(post)
  } catch (err) {
    next(err)
  }
}
