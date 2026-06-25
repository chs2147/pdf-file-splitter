import { Download, FileDown, AlertTriangle } from 'lucide-react'
import type { SplitPart } from '../lib/pdfSplitter'
import { formatBytes } from '../lib/format'
import { downloadAllAsZip, downloadPart } from '../lib/download'

interface Props {
  parts: SplitPart[]
  zipName: string
}

export function ResultList({ parts, zipName }: Props) {
  const totalSize = parts.reduce((sum, p) => sum + p.size, 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">
            분할 결과 · {parts.length}개 파일
          </h2>
          <p className="text-sm text-slate-500">
            전체 {formatBytes(totalSize)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadAllAsZip(parts, zipName)}
          className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 font-medium text-white shadow-sm transition hover:bg-brand-primary/90"
        >
          <Download size={18} />
          전체 ZIP 다운로드
        </button>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {parts.map((part) => (
          <li
            key={part.name}
            className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-slate-800">
                {part.name}
              </p>
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <span>
                  {part.startPage === part.endPage
                    ? `${part.startPage}페이지`
                    : `${part.startPage}–${part.endPage}페이지`}
                </span>
                <span>·</span>
                <span>{formatBytes(part.size)}</span>
                {part.oversize && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    <AlertTriangle size={12} />
                    용량 초과 (단일 페이지)
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadPart(part)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:border-brand-secondary hover:text-brand-secondary"
            >
              <FileDown size={16} />
              다운로드
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
