import JSZip from 'jszip'
import type { SplitPart } from './pdfSplitter'

function triggerDownload(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoke on the next tick so the download has a chance to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadPart(part: SplitPart) {
  // Copy into a fresh ArrayBuffer-backed view so it is a valid BlobPart
  // regardless of the underlying buffer type returned by pdf-lib.
  const copy = new Uint8Array(part.bytes.byteLength)
  copy.set(part.bytes)
  triggerDownload(new Blob([copy], { type: 'application/pdf' }), part.name)
}

export async function downloadAllAsZip(parts: SplitPart[], zipName: string) {
  const zip = new JSZip()
  for (const part of parts) zip.file(part.name, part.bytes)
  const blob = await zip.generateAsync({ type: 'blob' })
  triggerDownload(blob, zipName)
}
