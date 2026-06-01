import { Router } from 'express'
import { getBlogBySlug, getBlogs } from '../controllers/blogs.controller.js'

export const blogsRouter = Router()

blogsRouter.get('/blogs', getBlogs)
blogsRouter.get('/blogs/:slug', getBlogBySlug)
