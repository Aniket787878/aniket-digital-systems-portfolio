import { useEffect } from 'react'
import { useDocumentTitle } from '../../useDocumentTitle.js'

/* Document title plus the meta description for the /ai/* pages, restored on
   leave. About and Contact only set the title; these pages set both. */
export function usePageMeta(title, description) {
  useDocumentTitle(title)
  useEffect(() => {
    const tag = document.querySelector('meta[name="description"]')
    if (!tag) return undefined
    const before = tag.content
    tag.content = description
    return () => {
      tag.content = before
    }
  }, [description])
}
