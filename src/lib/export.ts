import { jsPDF } from 'jspdf';

export function download(name: string, text: string, type = 'text/markdown') {
  const url = URL.createObjectURL(new Blob([text], { type: type + ';charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export async function copy(text: string): Promise<boolean> {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall through */ }
  try {
    const t = document.createElement('textarea');
    t.value = text; t.style.position = 'fixed'; t.style.opacity = '0'; document.body.appendChild(t); t.select();
    const ok = document.execCommand('copy'); t.remove(); return ok;
  } catch { return false; }
}
const latin = (s: string) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-').replace(/→/g, '->').replace(/…/g, '...').replace(/[^\u0009\u000a -ÿ]/g, '');
const plain = (s: string) => latin(s).replace(/\*\*(.+?)\*\*/g, '$1').replace(/`([^`]+)`/g, '$1').replace(/\[(.+?)\]\((.+?)\)/g, '$1 ($2)');

/** Render the markdown report to a paginated PDF: headings, bullets, numbered lines and code blocks. */
export function savePDF(md: string, filename: string) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const M = 56, maxW = W - M * 2;
  let y = M;
  const ensure = (h: number) => { if (y + h > H - M) { doc.addPage(); y = M; } };
  const write = (text: string, size: number, font: 'times' | 'helvetica' | 'courier', style: 'normal' | 'bold' | 'italic', indent = 0, gap = 4, color: [number, number, number] = [18, 32, 25]) => {
    doc.setFont(font, style); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, maxW - indent) as string[];
    const lh = size * 1.38;
    lines.forEach((ln) => { ensure(lh); doc.text(ln, M + indent, y); y += lh; });
    y += gap;
  };
  let code = false;
  md.split('\n').forEach((raw) => {
    const line = latin(raw);
    if (/^```/.test(line)) { code = !code; return; }
    if (code) { write(line || ' ', 8.5, 'courier', 'normal', 8, 0); return; }
    if (!line.trim()) { y += 4; return; }
    let m;
    if ((m = line.match(/^# (.*)/))) { ensure(46); write(plain(m[1]), 24, 'times', 'bold', 0, 8); doc.setDrawColor(245, 138, 31); doc.setLineWidth(2); doc.line(M, y - 4, M + 60, y - 4); y += 8; }
    else if ((m = line.match(/^## (.*)/))) { y += 8; ensure(80); write(plain(m[1]), 16, 'times', 'bold', 0, 4); }
    else if ((m = line.match(/^### (.*)/))) { y += 4; ensure(60); write(plain(m[1]), 12.5, 'times', 'bold', 0, 2); }
    else if ((m = line.match(/^\s*[-*] (.*)/))) { ensure(14); doc.setFillColor(245, 138, 31); doc.circle(M + 4, y - 3.5, 1.8, 'F'); write(plain(m[1]), 10.5, 'helvetica', 'normal', 14, 2); }
    else if ((m = line.match(/^(\d+)\. (.*)/))) { write(`${m[1]}.  ${plain(m[2])}`, 10.5, 'helvetica', 'normal', 6, 2); }
    else write(plain(line), 10.5, 'helvetica', 'normal', 0, 3);
  });
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p); doc.setFont('courier', 'normal'); doc.setFontSize(8); doc.setTextColor(76, 97, 89);
    doc.text(`MINDMAP   ${p} / ${pages}`, M, H - 28);
  }
  doc.save(filename);
}
