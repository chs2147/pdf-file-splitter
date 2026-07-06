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
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-line pt-6">
        <div>
          <h2 className="font-display text-xl uppercase tracking-[0.1em] text-brand-white">
            분할 결과 · {parts.length}개 파일
          </h2>
          <p className="text-sm text-brand-silver">
            전체 {formatBytes(totalSize)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => downloadAllAsZip(parts, zipName)}
          className="inline-flex items-center gap-2 border border-brand-white bg-brand-white px-4 py-2 font-medium text-brand-black transition hover:bg-transparent hover:text-brand-white"
        >
          <Download size={18} />
          전체 ZIP 다운로드
        </button>
      </div>

      <ul className="divide-y divide-brand-line border border-brand-line bg-brand-charcoal">
        {parts.map((part) => (
          <li
            key={part.name}
            className="flex items-center gap-3 px-4 py-3 hover:bg-brand-black/40"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-brand-white">
                {part.name}
              </p>
              <p className="flex items-center gap-2 text-sm text-brand-silver">
                <span>
                  {part.startPage === part.endPage
                    ? `${part.startPage}페이지`
                    : `${part.startPage}–${part.endPage}페이지`}
                </span>
                <span>·</span>
                <span>{formatBytes(part.size)}</span>
                {part.oversize && (
                  <span className="inline-flex items-center gap-1 border border-amber-500/30 bg-amber-500/10 px-1.5 py-0.5 text-xs font-medium text-amber-400">
                    <AlertTriangle size={12} />
                    용량 초과 (단일 페이지)
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => downloadPart(part)}
              className="inline-flex items-center gap-1.5 border border-brand-line px-3 py-1.5 text-sm font-medium text-brand-silver transition hover:border-brand-white hover:text-brand-white"
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
