import { site } from '../data.js'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <p className="footer-brand">{site.name}</p>
        <a className="footer-meta" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </div>
    </footer>
  )
}
