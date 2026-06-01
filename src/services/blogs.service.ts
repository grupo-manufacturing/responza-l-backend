import { BlogPost } from '../models/BlogPost.js'

export type PublicBlogListItem = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  publishedAt: string
}

export type PublicBlogDetail = PublicBlogListItem & {
  content: string[]
}

type BlogPostDoc = {
  slug: string
  title: string
  excerpt: string
  category: string
  readTime: string
  content: string[]
  publishedAt?: Date | null
  createdAt: Date
}

function toListItem(doc: BlogPostDoc): PublicBlogListItem {
  const publishedAt = doc.publishedAt ?? doc.createdAt
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt,
    category: doc.category,
    readTime: doc.readTime,
    publishedAt: publishedAt.toISOString(),
  }
}

function toDetail(doc: BlogPostDoc): PublicBlogDetail {
  return {
    ...toListItem(doc),
    content: doc.content,
  }
}

export async function listPublishedBlogs(): Promise<PublicBlogListItem[]> {
  const docs = await BlogPost.find({ published: true })
    .sort({ publishedAt: -1, createdAt: -1 })
    .lean()
    .exec()
  return docs.map((doc) => toListItem(doc as BlogPostDoc))
}

export async function getPublishedBlogBySlug(slug: string): Promise<PublicBlogDetail | null> {
  const doc = await BlogPost.findOne({ slug, published: true }).lean().exec()
  if (!doc) return null
  return toDetail(doc as BlogPostDoc)
}
