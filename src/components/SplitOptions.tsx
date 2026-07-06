import { HardDrive, Layers, ListOrdered, FileStack } from 'lucide-react'
import type { ReactNode } from 'react'

export type CriterionKind = 'size' | 'everyN' | 'ranges' | 'individual'

export interface OptionState {
  criterion: CriterionKind
  maxMB: number
  pagesPerFile: number
  ranges: string
}

interface Props {
  value: OptionState
  onChange: (next: OptionState) => void
  disabled?: boolean
  totalPages: number | null
}

const CRITERIA: Array<{
  kind: CriterionKind
  title: string
  desc: string
  icon: ReactNode
}> = [
  {
    kind: 'size',
    title: '용량 기준',
    desc: '각 파일이 지정한 용량 이하가 되도록 분할',
    icon: <HardDrive size={20} />,
  },
  {
    kind: 'everyN',
    title: 'N페이지마다',
    desc: '지정한 페이지 수 단위로 분할',
    icon: <Layers size={20} />,
  },
  {
    kind: 'ranges',
    title: '페이지 범위 지정',
    desc: '예: 1-3, 5, 8-10 → 범위별로 분할',
    icon: <ListOrdered size={20} />,
  },
  {
    kind: 'individual',
    title: '페이지별 분할',
    desc: '모든 페이지를 개별 PDF로 분리',
    icon: <FileStack size={20} />,
  },
]

export function SplitOptions({ value, onChange, disabled, totalPages }: Props) {
  const set = (patch: Partial<OptionState>) => onChange({ ...value, ...patch })

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {CRITERIA.map((c) => {
          const active = value.criterion === c.kind
          return (
            <button
              key={c.kind}
              type="button"
              disabled={disabled}
              onClick={() => set({ criterion: c.kind })}
              className={`flex items-start gap-3 border p-4 text-left transition disabled:opacity-50 ${
                active
                  ? 'border-brand-white bg-brand-charcoal'
                  : 'border-brand-line bg-brand-black hover:border-brand-silver'
              }`}
            >
              <span
                className={`mt-0.5 ${
                  active ? 'text-brand-white' : 'text-brand-silver'
                }`}
              >
                {c.icon}
              </span>
              <span>
                <span className="block font-medium text-brand-white">
                  {c.title}
                </span>
                <span className="block text-sm text-brand-silver">{c.desc}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="border border-brand-line bg-brand-charcoal p-4">
        {value.criterion === 'size' && (
          <label className="block">
            <span className="text-sm font-medium text-brand-white">
              파일당 최대 용량 (MB)
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={value.maxMB}
              disabled={disabled}
              onChange={(e) =>
                set({ maxMB: Math.max(1, Number(e.target.value) || 1) })
              }
              className="mt-1 w-40 border border-brand-line bg-brand-black px-3 py-2 text-brand-white outline-none focus:border-brand-white disabled:opacity-50"
            />
            <span className="mt-1 block text-sm text-brand-silver">
              각 분할 파일이 이 용량을 넘지 않도록 페이지 순서대로 묶습니다.
            </span>
          </label>
        )}

        {value.criterion === 'everyN' && (
          <label className="block">
            <span className="text-sm font-medium text-brand-white">
              파일당 페이지 수
            </span>
            <input
              type="number"
              min={1}
              step={1}
              value={value.pagesPerFile}
              disabled={disabled}
              onChange={(e) =>
                set({ pagesPerFile: Math.max(1, Number(e.target.value) || 1) })
              }
              className="mt-1 w-40 border border-brand-line bg-brand-black px-3 py-2 text-brand-white outline-none focus:border-brand-white disabled:opacity-50"
            />
            {totalPages != null && (
              <span className="mt-1 block text-sm text-brand-silver">
                총 {totalPages} 페이지 →{' '}
                {Math.ceil(totalPages / Math.max(1, value.pagesPerFile))}개 파일
              </span>
            )}
          </label>
        )}

        {value.criterion === 'ranges' && (
          <label className="block">
            <span className="text-sm font-medium text-brand-white">
              페이지 범위
            </span>
            <input
              type="text"
              value={value.ranges}
              disabled={disabled}
              placeholder="예: 1-3, 5, 8-10"
              onChange={(e) => set({ ranges: e.target.value })}
              className="mt-1 w-full border border-brand-line bg-brand-black px-3 py-2 text-brand-white outline-none focus:border-brand-white disabled:opacity-50"
            />
            <span className="mt-1 block text-sm text-brand-silver">
              쉼표로 구분한 각 범위가 하나의 PDF가 됩니다.
              {totalPages != null && ` (총 ${totalPages} 페이지)`}
            </span>
          </label>
        )}

        {value.criterion === 'individual' && (
          <p className="text-sm text-brand-silver">
            {totalPages != null
              ? `${totalPages}개의 페이지가 각각 별도의 PDF 파일로 분리됩니다.`
              : '모든 페이지가 각각 별도의 PDF 파일로 분리됩니다.'}
          </p>
        )}
      </div>
    </div>
  )
}
