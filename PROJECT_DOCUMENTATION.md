# Colemearchy Blog - Comprehensive Project Documentation

## 🏗️ Project Overview

Colemearchy Blog is an AI-powered blog platform built with Next.js 15, featuring automated content generation using Google Gemini AI with RAG (Retrieval-Augmented Generation), scheduled publishing, and SEO optimization. The blog focuses on biohacking, tech leadership, and sovereign living content.

## 📁 Full Directory Structure

```
/Users/anhyunjun/colemearchy-blog/
├── src/                          # Source code directory
│   ├── app/                      # Next.js App Router pages
│   │   ├── about/               # About page
│   │   ├── admin/               # Admin dashboard (password protected)
│   │   │   ├── edit/[id]/       # Post editor
│   │   │   ├── new/             # Create new post
│   │   │   └── page.tsx         # Admin dashboard
│   │   ├── api/                 # API routes
│   │   │   ├── build-test/      # Build testing endpoint
│   │   │   ├── generate-content/# Manual content generation
│   │   │   ├── generate-daily-posts/ # Automated daily content generation
│   │   │   ├── index-now/       # IndexNow API for SEO
│   │   │   ├── og/              # Open Graph image generation
│   │   │   ├── posts/           # CRUD operations for posts
│   │   │   ├── publish-posts/   # Publish scheduled posts
│   │   │   └── test-*           # Various test endpoints
│   │   ├── contact/             # Contact page
│   │   ├── posts/[slug]/        # Dynamic post pages
│   │   ├── layout.tsx           # Root layout with metadata
│   │   ├── page.tsx             # Homepage with post listing
│   │   └── globals.css          # Global styles
│   ├── components/              # React components
│   │   └── PostEditor.tsx       # Markdown editor component
│   ├── lib/                     # Utility libraries
│   │   ├── ai-prompts.ts        # AI content generation prompts
│   │   └── prisma.ts            # Prisma client singleton
│   └── middleware.ts            # Admin authentication middleware
├── prisma/                      # Database schema
│   └── schema.prisma            # Prisma schema definition
├── public/                      # Static assets
│   ├── *.svg                    # SVG icons
│   ├── robots.txt               # SEO robots file
│   ├── sitemap.xml              # Sitemap for SEO
│   └── 1be72f77*.txt            # IndexNow verification file
├── scripts/                     # Utility scripts
│   └── embed-knowledge.ts       # Script to embed knowledge base
├── Configuration Files
│   ├── next.config.ts           # Next.js configuration
│   ├── tailwind.config.js       # Tailwind CSS configuration
│   ├── tsconfig.json            # TypeScript configuration
│   ├── vercel.json              # Vercel deployment configuration
│   ├── package.json             # Node.js dependencies
│   └── next-sitemap.config.js   # Sitemap generation config
└── Documentation
    ├── README.md                # Basic project readme
    ├── CLAUDE.md                # AI assistant instructions
    └── *.md                     # Various deployment and fix docs
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15.4.3 (App Router)
- **React**: 19.1.0
- **Styling**: Tailwind CSS 4.0
- **UI Components**: 
  - @uiw/react-md-editor 4.0.8 (Markdown editor)
  - react-markdown 10.1.0 (Markdown rendering)
- **Fonts**: Geist Sans & Geist Mono (Google Fonts)

### Backend
- **Runtime**: Node.js >=18.0.0
- **Package Manager**: pnpm >=8.0.0
- **Database**: PostgreSQL with pgvector extension
- **ORM**: Prisma 6.12.0
- **API**: Next.js API Routes with 300s max duration

### AI & Content Generation
- **AI Model**: Google Gemini 1.5 Flash
- **Embeddings**: text-embedding-004 (1536 dimensions)
- **RAG**: Vector similarity search using pgvector
- **Content Strategy**: Automated daily generation of 10 posts

### DevOps & Deployment
- **Platform**: Vercel
- **Cron Jobs**: Daily content generation at 6 AM UTC
- **SEO**: IndexNow API integration, dynamic sitemaps
- **Build Tools**: Turbopack for development

## 🎯 Key Features

### 1. AI-Powered Content Generation
- **RAG System**: Uses knowledge base embeddings for context-aware content
- **Daily Automation**: Generates 10 posts daily via cron job
- **Topic Generation**: AI generates relevant topics based on knowledge base
- **Quality Control**: Minimum 3000 words per post requirement

### 2. Content Management
- **Admin Dashboard**: Password-protected admin area
- **Post States**: Draft and Published
- **Scheduled Publishing**: Posts can be scheduled for future publication
- **Markdown Editor**: Full-featured markdown editor with preview

### 3. SEO Optimization
- **IndexNow Integration**: Instant indexing with search engines
- **Dynamic Sitemap**: Automatically generated sitemap
- **Meta Tags**: Comprehensive Open Graph and Twitter cards
- **Structured Data**: JSON-LD schema for better search visibility
- **Core Web Vitals**: Optimized for performance metrics

### 4. User Experience
- **Responsive Design**: Mobile-first approach
- **Image Optimization**: Next.js Image component with lazy loading
- **Newsletter Signup**: Email collection for audience building
- **Content Categories**: Featured, Popular, and Latest sections

## 📊 Database Schema

### Post Model
```prisma
model Post {
  id          String      @id @default(cuid())
  title       String
  slug        String      @unique
  content     String
  excerpt     String?
  coverImage  String?
  status      PostStatus  @default(DRAFT)
  scheduledAt DateTime?   // Scheduled publish time
  publishedAt DateTime?   // Actual publish time
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  author      String?
  tags        String[]    @default([])
  seoTitle    String?
  seoDescription String?
  views       Int         @default(0)
}
```

### Knowledge Model (RAG)
```prisma
model Knowledge {
  id        String                 @id @default(cuid())
  content   String                 @db.Text
  source    String?                // Book title or source
  embedding Unsupported("vector")? // 1536-dimension vector
  createdAt DateTime               @default(now())
}
```

### Admin Model
```prisma
model Admin {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 🔌 API Endpoints

### Public APIs
- `GET /api/posts` - List all published posts
- `GET /api/posts/[id]` - Get single post
- `GET /api/og` - Generate Open Graph images

### Protected APIs (Admin)
- `POST /api/posts` - Create new post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/generate-content` - Manual content generation
- `POST /api/publish-posts` - Publish scheduled posts

### Automated APIs (Cron)
- `POST /api/generate-daily-posts` - Daily content generation (6 AM UTC)
- `POST /api/index-now` - Submit URLs to search engines

## 🏛️ Architecture Patterns

### 1. Server Components First
- All pages use React Server Components by default
- Client components only for interactivity (PostEditor)
- Dynamic rendering for real-time content

### 2. RAG Implementation
```typescript
// Vector similarity search
const results = await prisma.$queryRaw`
  SELECT id, content, source, 
         1 - (embedding <=> ${queryEmbedding}::vector) as similarity
  FROM "Knowledge"
  ORDER BY embedding <=> ${queryEmbedding}::vector
  LIMIT ${limit}
`;
```

### 3. Middleware Pattern
- Admin authentication via Basic Auth
- Request interception before route handlers
- Centralized auth logic

### 4. Content Generation Pipeline
1. Generate topic ideas from knowledge base
2. Create embeddings for topics
3. Find similar knowledge via vector search
4. Generate content with RAG context
5. Schedule posts throughout the day
6. Auto-publish and index

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"

# AI Configuration
GEMINI_API_KEY="your_gemini_api_key"

# Site Configuration
NEXT_PUBLIC_SITE_URL="https://colemearchy.com"

# Security
ADMIN_PASSWORD="secure_admin_password"
CRON_SECRET="secure_cron_secret"

# SEO & Automation
INDEXNOW_API_KEY="1be72f77ad07473780ad911bb42cd461"
REDEPLOY_WEBHOOK_URL="vercel_webhook_url"
```

## 🚀 Deployment Setup

### Vercel Configuration
```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 300  // 5 minutes for AI generation
    }
  },
  "crons": [{
    "path": "/api/generate-daily-posts",
    "schedule": "0 6 * * *"  // Daily at 6 AM UTC
  }]
}
```

### Build Process
1. `prisma generate` - Generate Prisma client
2. `next build` - Build Next.js application
3. `next-sitemap` - Generate sitemap.xml

### Database Setup
1. PostgreSQL with pgvector extension
2. Run `prisma db push` to sync schema
3. Enable vector extension: `CREATE EXTENSION vector;`

## 📈 Performance Optimizations

1. **Image Optimization**
   - Next.js Image component
   - Lazy loading with proper sizes
   - WebP format support

2. **Font Loading**
   - Preloaded Google Fonts
   - Font display swap strategy
   - Variable fonts for flexibility

3. **Caching Strategy**
   - Force dynamic for real-time content
   - Static generation for about/contact pages
   - ISR consideration for posts

4. **Bundle Optimization**
   - Turbopack in development
   - Tree shaking in production
   - Code splitting by route

## 🔍 SEO Features

1. **Meta Tags**
   - Dynamic title templates
   - Comprehensive Open Graph data
   - Twitter card support

2. **Structured Data**
   - WebSite schema
   - Article schema for posts
   - Person schema for author

3. **Search Engine Integration**
   - IndexNow for instant indexing
   - XML sitemap generation
   - Robots.txt configuration

4. **Content Strategy**
   - E-E-A-T compliance
   - Keyword optimization
   - Internal linking structure

## 🎨 Design Decisions

1. **Content-First Design**
   - Minimal UI for focus on content
   - Typography-driven layout
   - Mobile-responsive grid system

2. **Brand Voice**
   - Raw, honest writing style
   - Personal anecdotes integration
   - Three content pillars focus

3. **User Journey**
   - Featured post prominence
   - Category-based discovery
   - Newsletter conversion focus

4. **Admin Experience**
   - Simple markdown editor
   - Real-time preview
   - Batch operations support

## 🔒 Security Measures

1. **Authentication**
   - Basic Auth for admin area
   - Environment-based passwords
   - No client-side secrets

2. **API Protection**
   - CRON_SECRET for automated tasks
   - Rate limiting considerations
   - Input validation

3. **Database Security**
   - Parameterized queries via Prisma
   - SQL injection prevention
   - Connection string encryption

## 📊 Monitoring & Analytics

1. **Error Tracking**
   - Console logging for debugging
   - Vercel function logs
   - Build-time type checking

2. **Performance Monitoring**
   - Lighthouse scores tracking
   - Core Web Vitals metrics
   - API response times

3. **Content Metrics**
   - Post views tracking
   - Generation success rates
   - Publishing schedules

## 🚦 Future Considerations

1. **Scaling**
   - CDN for static assets
   - Database connection pooling
   - Horizontal scaling ready

2. **Features**
   - Comment system
   - User accounts
   - Advanced analytics

3. **Content**
   - Multi-language support
   - Video content integration
   - Podcast transcription

---

**Last Updated**: January 2025
**Version**: 1.0.0
**Maintainer**: Colemearchy Team