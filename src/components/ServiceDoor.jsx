import { Link } from 'react-router-dom'
import { inCurrency } from '../currency.js'
import Icon from './icons.jsx'
import ServiceMedia from './ServiceMedia.jsx'

/* ---------------------------------------------------------------
   One service area as a card that opens its page: the area's picture,
   its name, its first headline line, the promise and where it starts.
   Used three at a time on the home page's Services band and two at a
   time at the foot of each service page. Styles: .door-* in
   HomePage.css, on top of the project .card.
   --------------------------------------------------------------- */
export default function ServiceDoor({ area, currency }) {
  return (
    <Link to={area.path} className="card door loop-video-host">
      <div className="card-media">
        <ServiceMedia media={area.media} className="card-video" />
        <span className="card-badge">
          {area.media.kind !== 'image' && <Icon name="play" size={10} />} {area.media.badge}
        </span>
      </div>
      <div className="card-body">
        <p className="door-kicker">
          <span className="door-icon" aria-hidden="true">
            <Icon name={area.icon} size={16} />
          </span>
          {area.name}
        </p>
        <h3 className="door-title">{area.title[0]}</h3>
        <p>{area.promise}</p>
        <p className="door-from">
          From <strong>{inCurrency(area.from, currency)}</strong>
        </p>
        <span className="text-link">
          Prices and proof <Icon name="arrow" size={16} />
        </span>
      </div>
    </Link>
  )
}
