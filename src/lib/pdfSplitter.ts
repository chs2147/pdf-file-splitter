import { PDFDocument } from 'pdf-lib'
import { parsePageRanges } from './format'

export interface SplitPart {
  /** Generated file name, e.g. "report_part1_p1-4.pdf" */
  name: string
  /** Serialized PDF bytes for this part. */
  bytes: Uint8Array
  /** Byte size of this part. */
  size: number
  /** One-based, inclusive page range covered by this part. */
  startPage: number
  endPage: number
  /** True when a single page on its own already exceeds the size limit. */
  oversize?: boolean
}

export type ProgressFn = (done: number, total: number) => void

export type SplitMode =
  | { kind: 'size'; maxBytes: number }
  | { kind: 'everyN'; pagesPerFile: number }
  | { kind: 'ranges'; expr: string }
  | { kind: 'individual' }

function buildName(base: string, index: number, start: number, end: number) {
  const pages = start === end ? `p${start}` : `p${start}-${end}`
  return `${base}_part${index}_${pages}.pdf`
}

async function buildPart(
  src: PDFDocument,
  pageIndices: number[],
): Promise<Uint8Array> {
  const out = await PDFDocument.create()
  const copied = await out.copyPages(src, pageIndices)
  copied.forEach((p) => out.addPage(p))
  return out.save()
}

/**
 * Split by page groups (everyN / ranges / individual). Each group becomes one
 * output PDF. Page order is preserved exactly.
 */
async function splitByGroups(
  src: PDFDocument,
  baseName: string,
  groups: Array<[number, number]>,
  onProgress?: ProgressFn,
): Promise<SplitPart[]> {
  const parts: SplitPart[] = []
  for (let i = 0; i < groups.length; i++) {
    const [start, end] = groups[i]
    const indices: number[] = []
    for (let p = start; p <= end; p++) indices.push(p)
    const bytes = await buildPart(src, indices)
    parts.push({
      name: buildName(baseName, i + 1, start + 1, end + 1),
      bytes,
      size: bytes.length,
      startPage: start + 1,
      endPage: end + 1,
    })
    onProgress?.(i + 1, groups.length)
  }
  return parts
}

/**
 * Split so that every output PDF stays at or below `maxBytes`. Pages are added
 * to the current part one at a time; when adding a page would push the part
 * over the limit, the part is finalized and the page starts a new one. Page
 * order is preserved and ranges are contiguous. A single page that alone
 * exceeds the limit is emitted on its own and flagged `oversize`.
 */
async function splitBySize(
  src: PDFDocument,
  baseName: string,
  maxBytes: number,
  onProgress?: ProgressFn,
): Promise<SplitPart[]> {
  const total = src.getPageCount()
  const parts: SplitPart[] = []

  let current = await PDFDocument.create()
  let startPage = 0
  let pageCount = 0
  let lastBytes: Uint8Array | null = null

  const finalize = (endPage: number, bytes: Uint8Array, oversize: boolean) => {
    parts.push({
      name: buildName(baseName, parts.length + 1, startPage + 1, endPage + 1),
      bytes,
      size: bytes.length,
      startPage: startPage + 1,
      endPage: endPage + 1,
      oversize: oversize || undefined,
    })
  }

  for (let i = 0; i < total; i++) {
    const [page] = await current.copyPages(src, [i])
    current.addPage(page)
    const bytes = await current.save()

    if (bytes.length > maxBytes && pageCount > 0) {
      // Adding page i overflowed: roll it back and finalize the current part.
      current.removePage(pageCount)
      finalize(i - 1, lastBytes!, false)

      // Start a fresh part beginning with page i.
      current = await PDFDocument.create()
      const [p2] = await current.copyPages(src, [i])
      current.addPage(p2)
      startPage = i
      pageCount = 1
      lastBytes = await current.save()
    } else {
      pageCount++
      lastBytes = bytes
    }
    onProgress?.(i + 1, total)
  }

  if (pageCount > 0 && lastBytes) {
    finalize(total - 1, lastBytes, pageCount === 1 && lastBytes.length > maxBytes)
  }

  return parts
}

/**
 * Split a PDF (given as bytes) according to `mode`. Returns the resulting parts.
 * Throws a (Korean-message) Error on invalid input such as an empty document or
 * a malformed page-range expression.
 */
export async function splitPdf(
  fileBytes: ArrayBuffer | Uint8Array,
  fileName: string,
  mode: SplitMode,
  onProgress?: ProgressFn,
): Promise<SplitPart[]> {
  const src = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
  const total = src.getPageCount()
  if (total === 0) throw new Error('빈 PDF 문서입니다. 분할할 페이지가 없습니다.')

  const baseName = fileName.replace(/\.pdf$/i, '') || 'document'

  switch (mode.kind) {
    case 'size':
      return splitBySize(src, baseName, mode.maxBytes, onProgress)

    case 'everyN': {
      const n = Math.max(1, Math.floor(mode.pagesPerFile))
      const groups: Array<[number, number]> = []
      for (let start = 0; start < total; start += n) {
        groups.push([start, Math.min(start + n - 1, total - 1)])
      }
      return splitByGroups(src, baseName, groups, onProgress)
    }

    case 'individual': {
      const groups: Array<[number, number]> = []
      for (let i = 0; i < total; i++) groups.push([i, i])
      return splitByGroups(src, baseName, groups, onProgress)
    }

    case 'ranges': {
      const groups = parsePageRanges(mode.expr, total)
      return splitByGroups(src, baseName, groups, onProgress)
    }
  }
}

/** Page count of a PDF without splitting it. */
export async function getPageCount(
  fileBytes: ArrayBuffer | Uint8Array,
): Promise<number> {
  const doc = await PDFDocument.load(fileBytes, { ignoreEncryption: true })
  return doc.getPageCount()
}
