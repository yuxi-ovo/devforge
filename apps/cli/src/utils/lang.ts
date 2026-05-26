const NON_EN_LANGS = ['docs-ja-jp', 'docs-ko-kr', 'docs-fr-fr', 'docs-de-de', 'docs-es-es', 'docs-pt-br', 'docs-ru-ru', 'docs-it-it']

export function langScore(id: string): number {
  if (id.includes('docs-zh-cn') || id.includes('docs-zh-tw')) return 2
  if (NON_EN_LANGS.some((l) => id.includes(l))) return 0
  return 1
}

export function isPreferredOver(newId: string, existingId: string): boolean {
  return langScore(newId) > langScore(existingId)
}
