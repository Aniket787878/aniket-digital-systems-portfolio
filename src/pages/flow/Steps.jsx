import { Link } from 'react-router-dom'
import { m } from 'motion/react'
import Icon from '../../components/icons.jsx'

/* ---------------------------------------------------------------
   The question engine shared by the free AI check (/ai-check) and the
   website and software plans (/start/website, /start/software): a
   progress bar, one question per screen (radio or checkbox cards in a
   fieldset), and the contact step with the honeypot. The look is
   AiCheckPage.css (prefix ac-); motion goes through Motion, so the one
   <MotionConfig reducedMotion="user"> in App.jsx covers it.
   --------------------------------------------------------------- */

import { stepIn } from './shared.js'

/* `questions` is how many question screens there are; the contact step
   is one more, so the bar reaches the end only on it. */
export function Progress({ step, questions, label = 'Progress through the check' }) {
  const n = step + 1
  const total = questions + 1
  return (
    <div className="ac-progress">
      <p className="stage-mono ac-count">{step < questions ? `Question ${n} of ${questions}` : 'Last step'}</p>
      <div className="ac-bar" role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={total} aria-valuenow={n}>
        <span style={{ width: `${(n / total) * 100}%` }} />
      </div>
    </div>
  )
}

/* One question. `q.kind` is 'one' (radio) or 'many' (checkboxes);
   `q.options` must already be resolved (the budget bands come from the
   visitor's currency, so the page passes them in). */
export function Question({ q, value, onAnswer, onNext, onBack, error, headRef, last }) {
  const many = q.kind === 'many'
  const headId = `ac-q-${q.id}`
  const hintId = q.hint ? `${headId}-hint` : undefined
  const errId = `${headId}-error`
  return (
    <m.form className="ac-step" onSubmit={onNext} noValidate {...stepIn}>
      <fieldset
        className="ac-fieldset"
        aria-labelledby={headId}
        aria-describedby={[hintId, error ? errId : null].filter(Boolean).join(' ') || undefined}
      >
        <h2 className="ac-question" id={headId} tabIndex={-1} ref={headRef}>
          {q.question}
        </h2>
        {q.hint && (
          <p className="ac-hint" id={hintId}>
            {q.hint}
          </p>
        )}
        <div className={`ac-options${many ? ' is-many' : ''}`}>
          {q.options.map((option) => {
            const checked = many ? value.includes(option.value) : value === option.value
            return (
              <label key={option.value} className={`ac-option${checked ? ' is-on' : ''}`}>
                <input
                  type={many ? 'checkbox' : 'radio'}
                  name={q.id}
                  value={option.value}
                  checked={checked}
                  onChange={() => onAnswer(q.id, option.value, many)}
                />
                <span className="ac-mark" aria-hidden="true" />
                <span>{option.label}</span>
              </label>
            )
          })}
        </div>
      </fieldset>

      {error && (
        <p className="ac-error" id={errId} role="alert">
          {error}
        </p>
      )}

      <div className="ac-nav">
        {onBack ? (
          <button type="button" className="ac-back" onClick={onBack}>
            Back
          </button>
        ) : (
          <span />
        )}
        <button type="submit" className="btn-saffron ac-next">
          {q.optional && (!value || value.length === 0) ? 'Skip' : last ? 'Last step' : 'Next'}
          <span className="btn-pill-icon" aria-hidden="true">
            <Icon name="arrow" size={16} />
          </span>
        </button>
      </div>
    </m.form>
  )
}

/* The contact step: name, email, optional WhatsApp, and the honeypot
   (the same as the contact form's: off-screen, out of the tab order and
   hidden from assistive tech, so only a bot fills it in). */
export function Contact({
  idPrefix,
  title,
  hint,
  submitLabel,
  name,
  email,
  phone,
  trap,
  setName,
  setEmail,
  setPhone,
  setTrap,
  onSubmit,
  onBack,
  error,
  headRef
}) {
  return (
    <m.form className="ac-step" onSubmit={onSubmit} noValidate {...stepIn}>
      <h2 className="ac-question" tabIndex={-1} ref={headRef}>
        {title}
      </h2>
      <p className="ac-hint">{hint}</p>

      <div className="ac-fields">
        <div className="ac-field">
          <label htmlFor={`${idPrefix}-name`}>Your name</label>
          <input
            id={`${idPrefix}-name`}
            className="ac-input"
            type="text"
            autoComplete="name"
            required
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="ac-field">
          <label htmlFor={`${idPrefix}-email`}>Your email</label>
          <input
            id={`${idPrefix}-email`}
            className="ac-input"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="ac-field">
          <label htmlFor={`${idPrefix}-phone`}>
            Your WhatsApp number <span className="ac-optional">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-phone`}
            className="ac-input"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            maxLength={30}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="contact-hp ac-hp" aria-hidden="true">
          <label htmlFor={`${idPrefix}-company-website`}>Company website</label>
          <input
            id={`${idPrefix}-company-website`}
            name="company_website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={trap}
            onChange={(e) => setTrap(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <p className="ac-error" role="alert">
          {error}
        </p>
      )}

      <div className="ac-nav">
        <button type="button" className="ac-back" onClick={onBack}>
          Back
        </button>
        <button type="submit" className="btn-saffron ac-next">
          {submitLabel}
          <span className="btn-pill-icon" aria-hidden="true">
            <Icon name="arrow" size={16} />
          </span>
        </button>
      </div>

      <p className="ac-privacy">
        Used only to reply to you.{' '}
        <Link className="u-link" to="/privacy">
          Privacy note
        </Link>
        .
      </p>
    </m.form>
  )
}
