import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type Database from 'better-sqlite3';

const hasKanji = (str: string) => /[\u4e00-\u9fff]/.test(str);

let cachedMissingIds: number[] | null = null;

function getMissingKanjiIds(db: Database.Database): number[] {
  if (cachedMissingIds !== null) return cachedMissingIds;

  const rows = db.prepare('SELECT id, headword, body FROM entries').all() as {
    id: number; headword: string; body: string;
  }[];

  const ids: number[] = [];

  for (const row of rows) {
    if (hasKanji(row.headword) || !row.body) continue;

    const match = row.body.match(/\[([^\]]+)\]/);
    if (!match || !hasKanji(match[1])) continue;

    const variants = match[1]
      .split('|')
      .map((v) => v.replace(/（([^）]*)）/g, (_, p1) => p1).replace(/\(([^)]*)\)/g, (_, p1) => p1).trim())
      .filter((v) => hasKanji(v));

    if (variants.length === 0) continue;

    const anyExists = variants.some((v) =>
      db.prepare('SELECT 1 FROM entries WHERE headword = ? LIMIT 1').get(v)
    );

    if (!anyExists) ids.push(row.id);
  }

  cachedMissingIds = ids;
  return ids;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startRow = parseInt(searchParams.get('startRow') || '0');
  const endRow = parseInt(searchParams.get('endRow') || '100');
  const search = searchParams.get('search') || '';
  const bodySearch = searchParams.get('bodySearch') || '';
  const sortField = searchParams.get('sortField') || 'id';
  const sortDir = searchParams.get('sortDir') === 'desc' ? 'DESC' : 'ASC';
  const missingKanji = searchParams.get('missingKanji') === 'true';
  const isExport = searchParams.get('export') === 'true';
  const limit = endRow - startRow;

  const db = getDb();

  const allowedSortFields = ['id', 'headword', 'display'];
  const safeSortField = allowedSortFields.includes(sortField) ? sortField : 'id';

  const conditions: string[] = [];
  const params: (string | number)[] = [];

  if (missingKanji) {
    const ids = getMissingKanjiIds(db);
    if (ids.length === 0) return NextResponse.json({ data: [], total: 0 });
    conditions.push(`id IN (${ids.join(',')})`);
  }

  if (search) {
    conditions.push('(headword LIKE ? OR display LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (bodySearch) {
    conditions.push('body LIKE ?');
    params.push(`%${bodySearch}%`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  if (isExport) {
    const rows = db
      .prepare(`SELECT id, headword, display, body FROM entries ${where} ORDER BY ${safeSortField} ${sortDir}`)
      .all(...params);
    return NextResponse.json({ data: rows });
  }

  const rows = db
    .prepare(`SELECT id, headword, display, body FROM entries ${where} ORDER BY ${safeSortField} ${sortDir} LIMIT ? OFFSET ?`)
    .all(...params, limit, startRow);

  const { total } = db
    .prepare(`SELECT COUNT(*) as total FROM entries ${where}`)
    .get(...params) as { total: number };

  return NextResponse.json({ data: rows, total });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { headword, display, body: entryBody } = body;

  if (!headword) {
    return NextResponse.json({ error: 'headword는 필수입니다.' }, { status: 400 });
  }

  const db = getDb();
  const result = db
    .prepare('INSERT INTO entries (headword, display, body) VALUES (?, ?, ?)')
    .run(headword, display ?? headword, entryBody ?? '');

  const newRow = db.prepare('SELECT * FROM entries WHERE id = ?').get(result.lastInsertRowid);
  return NextResponse.json({ data: newRow }, { status: 201 });
}
