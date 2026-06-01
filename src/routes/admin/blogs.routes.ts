import { Router } from 'express'
import type { Env } from '../../config/env.js'
import {
  deleteAdminBlogHandler,
  getAdminBlog,
  getAdminBlogs,
  patchPublishAdminBlog,
  postAdminBlog,
  putAdminBlog,
} from '../../controllers/adminBlogs.controller.js'
import { createRequireAdmin } from '../../middleware/requireAdmin.js'

export function createAdminBlogsRouter(env: Env) {
  const router = Router()
  const requireAdmin = createRequireAdmin(env)

  router.use(requireAdmin)
  router.get('/blogs', getAdminBlogs)
  router.get('/blogs/:id', getAdminBlog)
  router.post('/blogs', postAdminBlog)
  router.put('/blogs/:id', putAdminBlog)
  router.delete('/blogs/:id', deleteAdminBlogHandler)
  router.patch('/blogs/:id/publish', patchPublishAdminBlog)

  return router
}
