import { site } from '../data.js'

export default function ContactPage() {
  return (
    <section className="container page">
      <p className="eyebrow">Contact</p>
      <h1 className="page-title">Contact</h1>
      <p className="page-lede">
        If you have a complicated, inefficient or repetitive workflow that needs to
        become a better digital system, get in touch.
      </p>
      <p className="page-lede" style={{ marginTop: '2rem' }}>
        <a className="u-link" href={`mailto:${site.email}`}>
          {site.email}
        </a>
      </p>
    </section>
  )
}
