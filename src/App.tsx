import { useState } from 'react'
import { Scissors, Loader2, AlertCircle } from 'lucide-react'
import { FileDropzone } from './components/FileDropzone'
import { SplitOptions, type OptionState } from './components/SplitOptions'
import { ResultList } from './components/ResultList'
import {
  getPageCount,
  splitPdf,
  type SplitMode,
  type SplitPart,
} from './lib/pdfSplitter'
import { MB } from './lib/format'

const DEFAULT_OPTIONS: OptionState = {
  criterion: 'size',
  maxMB: 20,
  pagesPerFile: 10,
  ranges: '',
}

function buildMode(o: OptionState): SplitMode {
  switch (o.criterion) {
    case 'size':
      return { kind: 'size', maxBytes: o.maxMB * MB }
    case 'everyN':
      return { kind: 'everyN', pagesPerFile: o.pagesPerFile }
    case 'ranges':
      return { kind: 'ranges', expr: o.ranges }
    case 'individual':
      return { kind: 'individual' }
  }
}

export default function App() {
  const [file, setFile] = useState<File | null>(null)
  const [pageCount, setPageCount] = useState<number | null>(null)
  const [options, setOptions] = useState<OptionState>(DEFAULT_OPTIONS)
  const [parts, setParts] = useState<SplitPart[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async (f: File) => {
    setFile(f)
    setParts(null)
    setError(null)
    setPageCount(null)
    try {
      const buf = await f.arrayBuffer()
      setPageCount(await getPageCount(buf))
    } catch {
      setError('PDF 파일을 읽을 수 없습니다. 손상되었거나 올바른 PDF가 아닙니다.')
    }
  }

  const handleClear = () => {
    setFile(null)
    setPageCount(null)
    setParts(null)
    setError(null)
  }

  const handleSplit = async () => {
    if (!file) return
    setBusy(true)
    setError(null)
    setParts(null)
    setProgress(0)
    try {
      const buf = await file.arrayBuffer()
      const result = await splitPdf(buf, file.name, buildMode(options), (d, t) =>
        setProgress(Math.round((d / t) * 100)),
      )
      if (result.length <= 1 && options.criterion === 'size') {
        setError(
          '문서 전체가 지정한 용량 이하입니다. 분할할 필요가 없습니다.',
        )
      }
      setParts(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : '분할 중 오류가 발생했습니다.')
    } finally {
      setBusy(false)
    }
  }

  const zipName = file
    ? `${file.name.replace(/\.pdf$/i, '')}_split.zip`
    : 'split.zip'

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary text-white">
          <Scissors size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">PDF File Splitter</h1>
          <p className="text-sm text-slate-500">
            PDF를 용량 또는 페이지 기준으로 여러 파일로 분할합니다.
          </p>
        </div>
      </header>

      <div className="space-y-6">
        <FileDropzone
          file={file}
          pageCount={pageCount}
          onSelect={handleSelect}
          onClear={handleClear}
          disabled={busy}
        />

        {file && (
          <>
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
                분할 기준
              </h2>
              <SplitOptions
                value={options}
                onChange={setOptions}
                disabled={busy}
                totalPages={pageCount}
              />
            </section>

            <button
              type="button"
              onClick={handleSplit}
              disabled={busy || pageCount == null}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-secondary px-4 py-3 font-semibold text-white shadow-sm transition hover:bg-brand-secondary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  분할 중… {progress}%
                </>
              ) : (
                <>
                  <Scissors size={20} />
                  PDF 분할하기
                </>
              )}
            </button>
          </>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {parts && parts.length > 0 && (
          <ResultList parts={parts} zipName={zipName} />
        )}
      </div>

      <footer className="mt-12 text-center text-xs text-slate-400">
        모든 처리는 브라우저에서 이루어집니다 · pdf-lib 기반
      </footer>
    </div>
  )
}
