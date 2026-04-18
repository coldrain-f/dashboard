import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import JSZip from 'jszip';

const CHUNK_SIZE = 1000;

interface Entry {
  id: number;
  headword: string;
  display: string;
  body: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatBody(str: string): string {
  const lines = str
    .replace(/<br\s*\/?>/gi, '\n')   // <br> → 줄바꿈
    .replace(/<\/p>/gi, '\n')        // </p> → 줄바꿈
    .replace(/<\/div>/gi, '\n')      // </div> → 줄바꿈
    .replace(/<[^>]*>/g, ' ')        // 나머지 태그 → 공백 (붙음 방지)
    .replace(/[ \t]+/g, ' ')         // 연속 공백 → 단일 공백
    .replace(/\n{3,}/g, '\n\n')      // 3줄 이상 연속 줄바꿈 → 2줄로
    .trim()
    .split('\n')
    .map((line) => escapeXml(line.trim()).replace(/ /g, '&nbsp;\u200B'))
    .filter((line) => line.length > 0);

  return lines.map((line) => `<tr><td>${line}</td></tr>`).join('\n');
}

function generateHTML(entries: Entry[]): string {
  const entryBlocks = entries.map((e) => {
    const hw = escapeXml(e.headword);
    const dp = escapeXml(e.display ?? e.headword);
    const definition = formatBody(e.body ?? '');

    const inflSection =
      e.display && e.display !== e.headword
        ? `\n        <idx:infl><idx:iform value="${dp}"/></idx:infl>`
        : '';

    return `  <idx:entry name="word" scriptable="yes" spell="yes">
    <idx:orth value="${hw}">
    ${inflSection}
    </idx:orth>
    <table width="100%" border="0" cellpadding="0" cellspacing="0">
${definition}
    </table>
  </idx:entry>
  <mbp:pagebreak/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
  "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns:math="http://exslt.org/math"
      xmlns:svg="http://www.w3.org/2000/svg"
      xmlns:tl="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:saxon="http://saxon.sf.net/"
      xmlns:xs="http://www.w3.org/2001/XMLSchema"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:cx="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:dc="http://purl.org/dc/elements/1.1/"
      xmlns:mbp="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:mmc="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf"
      xmlns:idx="https://kindlegen.s3.amazonaws.com/AmazonKindlePublishingGuidelines.pdf">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
</head>
<body>
<mbp:frameset>
${entryBlocks}
</mbp:frameset>
</body>
</html>`;
}

function generateOPF(fileCount: number): string {
  const now = new Date().toISOString().slice(0, 10);

  const manifestItems = Array.from({ length: fileCount }, (_, i) => {
    const n = String(i + 1).padStart(3, '0');
    return `    <item id="content-${n}" href="content-${n}.html" media-type="application/xhtml+xml"/>`;
  }).join('\n');

  const spineItems = Array.from({ length: fileCount }, (_, i) => {
    const n = String(i + 1).padStart(3, '0');
    return `    <itemref idref="content-${n}"/>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="utf-8"?>
<package version="2.0" xmlns="http://www.idpf.org/2007/opf" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:title>KUMO 日韓辞典</dc:title>
    <dc:creator>KUMO</dc:creator>
    <dc:language>ja</dc:language>
    <dc:identifier id="uid">kumo-jk-dictionary-${now}</dc:identifier>
    <x-metadata>
      <DictionaryInLanguage>ja</DictionaryInLanguage>
      <DefaultLookupIndex>word</DefaultLookupIndex>
    </x-metadata>
  </metadata>
  <manifest>
${manifestItems}
  </manifest>
  <spine>
${spineItems}
  </spine>
</package>`;
}

export async function GET() {
  const db = getDb();
  const entries = db
    .prepare('SELECT id, headword, display, body FROM entries ORDER BY headword ASC')
    .all() as Entry[];

  // 5,000건씩 분할
  const chunks: Entry[][] = [];
  for (let i = 0; i < entries.length; i += CHUNK_SIZE) {
    chunks.push(entries.slice(i, i + CHUNK_SIZE));
  }

  const zip = new JSZip();
  const folder = zip.folder('kumo-dict')!;

  chunks.forEach((chunk, i) => {
    const n = String(i + 1).padStart(3, '0');
    folder.file(`content-${n}.html`, generateHTML(chunk));
  });

  folder.file('content.opf', generateOPF(chunks.length));

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  const filename = `kumo-dict-kindle-${new Date().toISOString().slice(0, 10)}.zip`;

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
