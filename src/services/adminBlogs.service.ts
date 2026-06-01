import mongoose from 'mongoose'
import { BlogPost } from '../models/BlogPost.js'
import { isValidSlug } from '../utils/slug.js'

export type AdminBlog = {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  content: string[]
  published: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

type BlogLean = {
  _id: mongoose.Types.ObjectId
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  content: string[]
  published: boolean
  publishedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export type ServiceFailure = {
  ok: false
  error: string
  status: 400 | 404 | 409
}

export type ServiceSuccess<T> = { ok: true; data: T }

export type ServiceResult<T> = ServiceSuccess<T> | ServiceFailure

function toAdminBlog(doc: BlogLean): AdminBlog {
  return {
    id: doc._id.toString(),
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    readTime: doc.readTime,
    content: doc.content,
    published: doc.published,
    publishedAt: doc.publishedAt ? doc.publishedAt.toISOString() : null,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: number }).code === 11000
  )
}

function hasPublishableContent(content: string[]): boolean {
  return content.some((p) => p.trim().length > 0)
}

export async function listAdminBlogs(): Promise<AdminBlog[]> {
  const docs = await BlogPost.find().sort({ updatedAt: -1 }).lean().exec()
  return docs.map((doc) => toAdminBlog(doc as BlogLean))
}

export async function getAdminBlogById(id: string): Promise<AdminBlog | null> {
  if (!mongoose.Types.ObjectId.isValid(id)) return null
  const doc = await BlogPost.findById(id).lean().exec()
  if (!doc) return null
  return toAdminBlog(doc as BlogLean)
}

export type CreateBlogInput = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  content: string[]
  published?: boolean
}

export async function createAdminBlog(input: CreateBlogInput): Promise<ServiceResult<AdminBlog>> {
  if (!isValidSlug(input.slug)) {
    return { ok: false, error: 'Slug must be lowercase letters, numbers, and hyphens only.', status: 400 }
  }

  const published = input.published ?? false
  if (published && !hasPublishableContent(input.content)) {
    return { ok: false, error: 'Add at least one paragraph before publishing.', status: 400 }
  }

  try {
    const doc = await BlogPost.create({
      slug: input.slug,
      title: input.title.trim(),
      excerpt: input.excerpt.trim(),
      category: input.category.trim(),
      readTime: input.readTime.trim(),
      content: input.content,
      published,
      publishedAt: published ? new Date() : undefined,
    })
    return { ok: true, data: toAdminBlog(doc.toObject() as BlogLean) }
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { ok: false, error: 'A post with this slug already exists.', status: 409 }
    }
    throw err
  }
}

export type UpdateBlogInput = {
  slug?: string
  title?: string
  excerpt?: string
  category?: string
  readTime?: string
  content?: string[]
  published?: boolean
}

export async function updateAdminBlog(
  id: string,
  input: UpdateBlogInput,
): Promise<ServiceResult<AdminBlog>> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, error: 'Not found.', status: 404 }
  }

  const doc = await BlogPost.findById(id).exec()
  if (!doc) {
    return { ok: false, error: 'Not found.', status: 404 }
  }

  if (input.slug !== undefined) {
    if (!isValidSlug(input.slug)) {
      return { ok: false, error: 'Slug must be lowercase letters, numbers, and hyphens only.', status: 400 }
    }
    doc.slug = input.slug
  }
  if (input.title !== undefined) doc.title = input.title.trim()
  if (input.excerpt !== undefined) doc.excerpt = input.excerpt.trim()
  if (input.category !== undefined) doc.category = input.category.trim()
  if (input.readTime !== undefined) doc.readTime = input.readTime.trim()
  if (input.content !== undefined) doc.content = input.content

  if (input.published !== undefined) {
    if (input.published && !hasPublishableContent(doc.content)) {
      return { ok: false, error: 'Add at least one paragraph before publishing.', status: 400 }
    }
    doc.published = input.published
    if (input.published && !doc.publishedAt) {
      doc.publishedAt = new Date()
    }
    if (!input.published) {
      doc.publishedAt = undefined
    }
  }

  try {
    await doc.save()
    return { ok: true, data: toAdminBlog(doc.toObject() as BlogLean) }
  } catch (err) {
    if (isDuplicateKeyError(err)) {
      return { ok: false, error: 'A post with this slug already exists.', status: 409 }
    }
    throw err
  }
}

export async function deleteAdminBlog(id: string): Promise<ServiceResult<null>> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, error: 'Not found.', status: 404 }
  }

  const doc = await BlogPost.findByIdAndDelete(id).exec()
  if (!doc) {
    return { ok: false, error: 'Not found.', status: 404 }
  }

  return { ok: true, data: null }
}

export async function publishAdminBlog(id: string): Promise<ServiceResult<AdminBlog>> {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return { ok: false, error: 'Not found.', status: 404 }
  }

  const doc = await BlogPost.findById(id).exec()
  if (!doc) {
    return { ok: false, error: 'Not found.', status: 404 }
  }

  if (!hasPublishableContent(doc.content)) {
    return { ok: false, error: 'Add at least one paragraph before publishing.', status: 400 }
  }

  doc.published = true
  if (!doc.publishedAt) {
    doc.publishedAt = new Date()
  }

  await doc.save()
  return { ok: true, data: toAdminBlog(doc.toObject() as BlogLean) }
}
