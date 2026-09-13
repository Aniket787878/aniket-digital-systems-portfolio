import { useEffect } from 'react'

/* Per-route <title>. React Router does not touch the document title, so
   without this every route kept index.html's home title in the tab and in
   shared links. A four-line hook rather than react-helmet: the five-runtime-
   dependency budget (see CLAUDE.md) does not spend one on this.

   No cleanup that restores a previous title — each page sets its own on
   mount, so the next route overwrites it. The home page passes the same
   string index.html ships, so a hard refresh and a client nav agree. */
export function useDocumentTitle(title) {
  useEffect(() => {
    if (title) document.title = title
  }, [title])
}
