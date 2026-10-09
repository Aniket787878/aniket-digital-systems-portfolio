import { Link } from 'react-router-dom'
import { site } from '../data.js'
import { useDocumentTitle } from '../useDocumentTitle.js'
import { Rehook } from '../components/FunnelCta.jsx'

/*
  Privacy: short and plain on purpose. It states only what the site
  actually does. No compliance claims (GDPR, HIPAA or otherwise): nothing
  here has been audited, so the page does not say it has.
*/
export default function PrivacyPage() {
  useDocumentTitle('Privacy · Aniket')
  return (
    <section className="container page privacy">
      <p className="eyebrow">Privacy</p>
      <h1 className="page-title">What happens to what you send</h1>

      <h2 className="case-section-title">What the contact form collects</h2>
      <p className="page-lede">
        Your name, your email, your company if you give it, a description of
        the workflow you want automated, and the budget band you pick. It also
        records the page you came from and the time you sent it. Nothing else:
        no account, no tracking cookies from the form.
      </p>

      <h2 className="case-section-title">What the free AI check and the website and software plans collect</h2>
      <p className="page-lede">
        Your answers to their questions (including the budget band you
        pick in a plan), your name, your email and your WhatsApp number if
        you give it. They go the same way as the contact form and are kept
        and deleted the same way.
      </p>

      <h2 className="case-section-title">Visit counts</h2>
      <p className="page-lede">
        The site counts page visits and button clicks with Vercel Web
        Analytics, to see which pages help people. It sets no cookies and
        does not identify you or follow you to other sites.
      </p>

      <h2 className="case-section-title">Why</h2>
      <p className="page-lede">
        Only to reply to you and to prepare for a call about your project. It
        is never sold, shared for marketing or added to a mailing list.
      </p>

      <h2 className="case-section-title">Where it goes</h2>
      <p className="page-lede">
        When the form is switched on, it sends your message to an
        automation workflow I run, which forwards it to my email inbox. If you message me on WhatsApp or by
        email instead, it stays in that WhatsApp chat or email inbox.
      </p>

      <h2 className="case-section-title">How long it is kept</h2>
      <p className="page-lede">
        If we do not end up working together, your details are deleted 12
        months after our last contact. If you become a client, they are kept
        for as long as we work together.
      </p>

      <h2 className="case-section-title">Deleting it sooner</h2>
      <p className="page-lede">
        Email{' '}
        <a className="u-link" href={`mailto:${site.email}`}>
          {site.email}
        </a>{' '}
        and ask. I will delete what I hold about you and confirm when it is
        done.
      </p>

      <p className="page-lede">
        <Link className="u-link" to="/contact">
          Back to contact
        </Link>
      </p>
      <Rehook
        className="rehook-start"
        question="Ready when you are:"
        label="pick a website, software or AI, about three minutes"
        placement="privacy"
      />
    </section>
  )
}
