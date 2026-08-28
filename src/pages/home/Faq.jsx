import { useState } from 'react'
import { Link } from 'react-router-dom'
import { faq } from '../../data.js'
import ArrowIcon from '../../components/ArrowIcon.jsx'

/* ---------------------------------------------------------------
   4 — FAQ. Real disclosure buttons, one open at a time.
   --------------------------------------------------------------- */
export default function Faq() {
  const [openIndex, setOpenIndex] = useState(null)

  return (
    <section className="faq">
      <div className="container faq-grid">
        <div className="faq-intro">
          <p className="kicker">Frequently Asked Questions</p>
          <h2 className="split-title">Answers to common questions</h2>
          <p className="faq-lede">
            Scope, cost, ownership and what I need from you before anything
            starts.
          </p>
          <Link to="/contact" className="btn-pill">
            Contact me
            <span className="btn-pill-icon" aria-hidden="true">
              <ArrowIcon />
            </span>
          </Link>
        </div>

        <ul className="faq-list">
          {faq.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <li
                key={item.q}
                className={`faq-item${isOpen ? ' faq-item-open' : ''}`}
              >
                <h3>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                  >
                    <span className="faq-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path
                          d="M12 5v14M5 12h14"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </span>
                    <span className="faq-q-text">{item.q}</span>
                  </button>
                </h3>
                {/* Rendered hidden rather than unmounted, so the button's
                    aria-controls always points at a real element. */}
                <div
                  className="faq-a"
                  id={`faq-a-${i}`}
                  role="region"
                  aria-labelledby={`faq-q-${i}`}
                  hidden={!isOpen}
                >
                  <p>{item.a}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
