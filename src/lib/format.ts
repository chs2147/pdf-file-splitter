export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes / Math.pow(1024, i)
  return `${value.toFixed(value >= 100 || i === 0 ? 0 : 1)} ${units[i]}`
}

export const MB = 1024 * 1024

/**
 * Parse a page-range expression like "1-3, 5, 8-10" into zero-based,
 * inclusive [start, end] tuples. Validates against the total page count.
 * Throws an Error (Korean message) on malformed or out-of-range input.
 */
export function parsePageRanges(
  expr: string,
  totalPages: number,
): Array<[number, number]> {
  const trimmed = expr.trim()
  if (!trimmed) throw new Error('페이지 범위를 입력하세요. (예: 1-3, 5, 8-10)')

  const ranges: Array<[number, number]> = []
  for (const rawPart of trimmed.split(',')) {
    const part = rawPart.trim()
    if (!part) continue

    const match = part.match(/^(\d+)\s*(?:-\s*(\d+))?$/)
    if (!match) throw new Error(`잘못된 범위 형식입니다: "${part}"`)

    const start = parseInt(match[1], 10)
    const end = match[2] ? parseInt(match[2], 10) : start

    if (start < 1 || end < 1)
      throw new Error(`페이지 번호는 1 이상이어야 합니다: "${part}"`)
    if (start > end)
      throw new Error(`시작 페이지가 끝 페이지보다 큽니다: "${part}"`)
    if (end > totalPages)
      throw new Error(
        `페이지 범위가 문서 전체 페이지(${totalPages})를 초과합니다: "${part}"`,
      )

    ranges.push([start - 1, end - 1])
  }

  if (ranges.length === 0) throw new Error('유효한 페이지 범위가 없습니다.')
  return ranges
}
