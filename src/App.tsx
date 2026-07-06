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
    <div className="min-h-full bg-brand-black">
      <div className="mx-auto max-w-3xl px-4 py-16">
        <header className="mb-12 flex items-center gap-4 border-b border-brand-line pb-8">
          <Scissors size={32} className="text-brand-white" />
          <h1 className="font-display text-4xl uppercase tracking-[0.08em] text-brand-white">
            PDF File Splitter
          </h1>
        </header>

        <div className="space-y-8">
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
                <h2 className="mb-4 font-display text-lg uppercase tracking-[0.2em] text-brand-silver">
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
                className="inline-flex w-full items-center justify-center gap-2 border border-brand-white bg-brand-white px-4 py-4 font-display text-lg uppercase tracking-[0.15em] text-brand-black transition hover:bg-transparent hover:text-brand-white disabled:cursor-not-allowed disabled:border-brand-line disabled:bg-transparent disabled:text-brand-silver"
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
            <div className="flex items-start gap-2 border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-400">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {parts && parts.length > 0 && (
            <ResultList parts={parts} zipName={zipName} />
          )}
        </div>

        <footer className="mt-16 border-t border-brand-line pt-6 text-center text-xs uppercase tracking-[0.2em] text-brand-silver">
          모든 처리는 브라우저에서 이루어집니다 · pdf-lib 기반
        </footer>
      </div>
    </div>
  )
}
