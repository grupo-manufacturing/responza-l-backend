import { Schema, model } from 'mongoose'

const blogPostSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    excerpt: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    readTime: { type: String, required: true, trim: true },
    content: { type: [String], default: [] },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
  },
  { timestamps: true, collection: 'blog_posts' },
)

blogPostSchema.index({ published: 1, publishedAt: -1 })

export const BlogPost = model('BlogPost', blogPostSchema)
