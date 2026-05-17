export const dynamic = 'force-dynamic'

/**
 * /api/admin/knowledge - 전문 지식 관리 API
 *
 * - 시스템 지침(system-instruction.md)은 Setting 테이블에 저장
 * - 지식 파일은 Knowledge 테이블에 저장 (Vercel 서버리스 파일시스템 read-only 대응)
 * - 업로드는 모두 JSON(텍스트)으로 받음 — PDF는 브라우저에서 텍스트를 추출해 전송
 *   (Vercel 요청 본문 4.5MB 제한 및 서버리스 PDF 파싱 불안정 회피)
 * - 업로드한 지식은 AI 글 생성 시 키워드 RAG로 참조됨 (getRelevantKnowledgeContext)
 */
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { prisma } from '@/lib/prisma'
import { verifyAdminAuth } from '@/lib/auth'
import { MASTER_SYSTEM_PROMPT, SYSTEM_INSTRUCTION_KEY } from '@/lib/ai-prompts'

const EDIT_EXTENSIONS = ['.md', '.txt']
const SYSTEM_INSTRUCTION_FILE = 'system-instruction.md'
const MAX_CONTENT_LENGTH = 4_000_000 // ~4MB (Vercel 요청 본문 한도 여유분)

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
}

/**
 * GET /api/admin/knowledge
 * - ?filename=system-instruction.md : 시스템 지침 조회
 * - ?filename=xxx : 개별 지식 파일 조회
 * - (없음) : 지식 파일 목록 조회
 */
export async function GET(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorized()

  const filename = request.nextUrl.searchParams.get('filename')

  // 시스템 지침 조회
  if (filename === SYSTEM_INSTRUCTION_FILE) {
    const setting = await prisma.setting.findUnique({ where: { key: SYSTEM_INSTRUCTION_KEY } })
    return NextResponse.json({
      filename: SYSTEM_INSTRUCTION_FILE,
      content: setting?.value || MASTER_SYSTEM_PROMPT,
    })
  }

  // 개별 지식 파일 조회
  if (filename) {
    const safeName = path.basename(filename)
    const record = await prisma.knowledge.findFirst({
      where: { source: safeName },
      orderBy: { createdAt: 'desc' },
    })
    if (!record) {
      return NextResponse.json({ error: '파일을 찾을 수 없습니다.' }, { status: 404 })
    }
    return NextResponse.json({ filename: safeName, content: record.content })
  }

  // 전체 목록 조회
  try {
    const records = await prisma.knowledge.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, source: true, content: true, createdAt: true },
    })
    const files = records.map((record) => ({
      name: record.source || `knowledge-${record.id}.txt`,
      size: Buffer.byteLength(record.content, 'utf-8'),
      updatedAt: record.createdAt.toISOString(),
      preview:
        record.content
          .split('\n')
          .find((line) => line.trim() && !line.startsWith('#'))
          ?.trim()
          .slice(0, 100) || '',
      archived: true,
    }))
    return NextResponse.json({ files })
  } catch {
    return NextResponse.json({ files: [] })
  }
}

/**
 * POST /api/admin/knowledge
 * JSON { filename, content }
 * - filename === 'system-instruction.md' : 시스템 지침 저장 (Setting 테이블)
 * - 그 외 (.md/.txt) : 지식 파일 저장/수정 (Knowledge 테이블)
 *   PDF는 브라우저에서 텍스트 추출 후 .txt 로 전송됨
 */
export async function POST(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorized()

  try {
    const { filename, content } = await request.json()

    if (!filename || typeof content !== 'string') {
      return NextResponse.json({ error: '파일 이름과 내용이 필요합니다.' }, { status: 400 })
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      return NextResponse.json(
        { error: '내용이 너무 깁니다. 파일을 나눠서 업로드해주세요.' },
        { status: 400 }
      )
    }

    // 시스템 지침 저장 (Setting 테이블)
    if (filename === SYSTEM_INSTRUCTION_FILE) {
      await prisma.setting.upsert({
        where: { key: SYSTEM_INSTRUCTION_KEY },
        update: { value: content },
        create: { key: SYSTEM_INSTRUCTION_KEY, value: content },
      })
      return NextResponse.json({ ok: true, filename: SYSTEM_INSTRUCTION_FILE })
    }

    // 지식 파일 저장 (Knowledge 테이블)
    const safeName = path.basename(filename)
    const ext = path.extname(safeName).toLowerCase()
    if (!EDIT_EXTENSIONS.includes(ext)) {
      return NextResponse.json(
        { error: '.md 또는 .txt 형식만 저장할 수 있습니다.' },
        { status: 400 }
      )
    }
    if (!content.trim()) {
      return NextResponse.json({ error: '내용이 비어 있습니다.' }, { status: 400 })
    }

    await prisma.knowledge.deleteMany({ where: { source: safeName } })
    await prisma.knowledge.create({ data: { source: safeName, content } })

    return NextResponse.json({ ok: true, filename: safeName })
  } catch {
    return NextResponse.json({ error: '파일 저장에 실패했습니다.' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/knowledge
 * 지식 파일 삭제
 */
export async function DELETE(request: NextRequest) {
  if (!verifyAdminAuth(request)) return unauthorized()

  try {
    const { filename } = await request.json()
    if (!filename) {
      return NextResponse.json({ error: '파일 이름이 필요합니다.' }, { status: 400 })
    }
    const safeName = path.basename(filename)
    await prisma.knowledge.deleteMany({ where: { source: safeName } })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: '파일 삭제에 실패했습니다.' }, { status: 500 })
  }
}
