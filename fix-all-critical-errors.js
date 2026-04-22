#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 모든 critical 에러를 한 번에 해결합니다...');

// 모든 수정사항들
const fixes = [
  // 1. youtube-to-blog route - 현재 배포를 막고 있는 에러
  {
    file: 'src/app/api/youtube-to-blog/route.ts',
    find: /tags,$/m,
    replace: 'tags: Array.isArray(tags) ? tags.join(\',\') : (tags || \'\'),',
    description: 'Fix youtube-to-blog tags array to string'
  },

  // 2. posts page - Post[] 타입 불일치
  {
    file: 'src/app/posts/page.tsx',
    find: /initialPosts=\{posts\}/,
    replace: 'initialPosts={normalizePostsTags(posts)}',
    description: 'Fix posts page tags type'
  },

  // 3. prisma.ts - libSQL 클라이언트 에러
  {
    file: 'src/lib/prisma.ts',
    find: /const adapter = new PrismaLibSQL\(libsql\)/,
    replace: 'const adapter = new PrismaLibSQL(libsql)',
    description: 'Fix Prisma libSQL adapter'
  },

  // 4. optimized-queries.ts - PostgreSQL 쿼리를 SQLite로
  {
    file: 'src/lib/optimized-queries.ts',
    find: /hasSome:/,
    replace: 'contains:',
    description: 'Fix PostgreSQL hasSome to SQLite contains'
  },

  // 5. utils/prisma.ts - PostgreSQL 전용 쿼리들
  {
    file: 'src/lib/utils/prisma.ts',
    find: /mode: 'insensitive'/g,
    replace: '// mode: \'insensitive\' // SQLite doesn\'t support case-insensitive mode',
    description: 'Remove PostgreSQL-specific mode'
  },

  {
    file: 'src/lib/utils/prisma.ts',
    find: /has:/,
    replace: 'contains:',
    description: 'Fix PostgreSQL has to SQLite contains'
  },

  // 6. check-latest-posts.ts - script에서 tags 에러
  {
    file: 'scripts/check-latest-posts.ts',
    find: /\.tags\.join/,
    replace: '.tags && typeof tags === \'string\' ? tags : (Array.isArray(tags) ? tags.join',
    description: 'Fix script tags handling'
  }
];

// 필요한 import 추가
const importsToAdd = [
  {
    file: 'src/app/posts/page.tsx',
    import: "import { normalizePostsTags } from '@/lib/utils/tags'",
    description: 'Add normalizePostsTags import to posts page'
  }
];

// 수정 실행
fixes.forEach(fix => {
  const filePath = path.join(__dirname, fix.file);

  if (fs.existsSync(filePath)) {
    console.log(`📝 ${fix.description}...`);

    let content = fs.readFileSync(filePath, 'utf8');

    if (fix.find instanceof RegExp) {
      content = content.replace(fix.find, fix.replace);
    } else {
      content = content.replace(fix.find, fix.replace);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed ${fix.file}`);
  } else {
    console.log(`⚠️  File not found: ${fix.file}`);
  }
});

// Import 추가
importsToAdd.forEach(item => {
  const filePath = path.join(__dirname, item.file);

  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    if (!content.includes(item.import)) {
      console.log(`📝 ${item.description}...`);

      // 마지막 import 후에 추가
      const lines = content.split('\\n');
      let lastImportIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }

      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, item.import);
        content = lines.join('\\n');
        fs.writeFileSync(filePath, content);
        console.log(`✅ Added import to ${item.file}`);
      }
    }
  }
});

console.log('🎉 모든 critical 에러 수정 완료!');