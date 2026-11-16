import type { MultiLanguageModel } from '~~/api-client/generated/iop-core'
import { APP_LANGUAGES, type AppLanguage } from '~/constants/langages'

type TranslatedString = Record<string, string>

export function getCurrentTranslation(
  translations: TranslatedString | undefined = {},
  locale: AppLanguage,
  fallbackOrder: readonly AppLanguage[] = APP_LANGUAGES,
): string {
  return (
    translations[locale]
    || fallbackOrder.map(lang => translations[lang]).find(Boolean)
    || Object.values(translations)[0]
    || ''
  )
}

/**
 * Get the text of a multilingual iop-core value in the given language.
 * If not available, the languages of fallbackOrder are tried in order, then any available language.
 *
 * @param value multilingual value
 * @param lang language
 * @param fallbackOrder the languages to try when lang has no text, APP_LANGUAGES by default
 * @returns the text, or an empty string
 */
export function localize(
  value: MultiLanguageModel | undefined,
  lang: AppLanguage | string,
  fallbackOrder: readonly AppLanguage[] = APP_LANGUAGES,
): string {
  return getCurrentTranslation({ ...value } as TranslatedString, lang as AppLanguage, fallbackOrder)
}
