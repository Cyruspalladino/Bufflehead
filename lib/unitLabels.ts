export function unitLabels<T extends { id: number; name: string }>(items: T[]) {
  const totals: Record<string, number> = {}
  for (const i of items) totals[i.name] = (totals[i.name] ?? 0) + 1

  const running: Record<string, number> = {}
  const labels = new Map<number, string>()
  for (const i of [...items].sort((a, b) => a.id - b.id)) {
    running[i.name] = (running[i.name] ?? 0) + 1
    labels.set(
      i.id,
      totals[i.name] > 1 ? `${i.name} #${running[i.name]}` : i.name
    )
  }
  return labels
}