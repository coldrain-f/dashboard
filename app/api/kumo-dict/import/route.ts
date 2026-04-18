import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

interface ImportEntry {
  id?: number | null;
  headword: string;
  display?: string;
  body?: string;
}

export async function POST(req: NextRequest) {
  const { entries } = await req.json() as { entries: ImportEntry[] };

  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: '데이터가 없습니다.' }, { status: 400 });
  }

  const db = getDb();

  const insertStmt = db.prepare('INSERT INTO entries (headword, display, body) VALUES (?, ?, ?)');
  const updateStmt = db.prepare('UPDATE entries SET headword = ?, display = ?, body = ? WHERE id = ?');
  const existsStmt = db.prepare('SELECT 1 FROM entries WHERE id = ? LIMIT 1');

  let inserted = 0;
  let updated = 0;

  db.transaction(() => {
    for (const entry of entries) {
      const { id, headword, display, body } = entry;
      if (!headword) continue;

      if (id && id > 0 && existsStmt.get(id)) {
        updateStmt.run(headword, display ?? headword, body ?? '', id);
        updated++;
      } else {
        insertStmt.run(headword, display ?? headword, body ?? '');
        inserted++;
      }
    }
  })();

  return NextResponse.json({ inserted, updated });
}
