import { useCallback, useRef, useState } from 'react'
import { FileText, UploadCloud, X } from 'lucide-react'
import { formatBytes } from '../lib/format'

interface Props {
  file: File | null
  pageCount: number | null
  onSelect: (file: File) => void
  onClear: () => void
  disabled?: boolean
}

export function FileDropzone({
  file,
  pageCount,
  onSelect,
  onClear,
  disabled,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const f = files[0]
      if (f.type !== 'application/pdf' && !f.name.toLowerCase().endsWith('.pdf')) {
        alert('PDF 파일만 업로드할 수 있습니다.')
        return
      }
      onSelect(f)
    },
    [onSelect],
  )

  if (file) {
    return (
      <div className="flex items-center gap-4 border border-brand-line bg-brand-charcoal p-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-brand-line text-brand-white">
          <FileText size={24} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-brand-white">{file.name}</p>
          <p className="text-sm text-brand-silver">
            {formatBytes(file.size)}
            {pageCount != null && ` · ${pageCount} 페이지`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          className="p-2 text-brand-silver transition hover:text-brand-white disabled:opacity-40"
          aria-label="파일 제거"
        >
          <X size={20} />
        </button>
      </div>
    )
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex cursor-pointer flex-col items-center justify-center gap-3 border border-dashed p-12 text-center transition ${
        dragging
          ? 'border-brand-white bg-brand-charcoal'
          : 'border-brand-line bg-brand-black hover:border-brand-silver'
      }`}
    >
      <div className="flex h-14 w-14 items-center justify-center border border-brand-line text-brand-white">
        <UploadCloud size={28} />
      </div>
      <div>
        <p className="font-medium text-brand-white">
          PDF 파일을 끌어다 놓거나 클릭하여 선택하세요
        </p>
        <p className="mt-1 text-sm text-brand-silver">
          업로드한 파일은 브라우저 안에서만 처리되며 서버로 전송되지 않습니다.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
