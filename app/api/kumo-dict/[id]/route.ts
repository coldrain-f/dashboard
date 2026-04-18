import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { headword, display, body: entryBody } = body;

  const db = getDb();
  const existing = db.prepare('SELECT id FROM entries WHERE id = ?').get(id);
  if (!existing) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  db.prepare('UPDATE entries SET headword = ?, display = ?, body = ? WHERE id = ?')
    .run(headword, display, entryBody, id);

  const updated = db.prepare('SELECT * FROM entries WHERE id = ?').get(id);
  return NextResponse.json({ data: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const db = getDb();
  const existing = db.prepare('SELECT id FROM entries WHERE id = ?').get(id);
  if (!existing) {
    return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
  }

  db.prepare('DELETE FROM entries WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
}
