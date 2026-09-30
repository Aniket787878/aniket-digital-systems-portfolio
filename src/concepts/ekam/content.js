export const MANIFESTO =
  'We teach yoga the way it was meant to be learned: slowly. Classes stay small, so your teacher knows your name and your knees. Every session begins with the breath and ends in stillness. No mirrors, no loud music, no rush. Just a wooden floor under the mango trees, Assagao waking up outside, and an hour that belongs to you.'

export const CLASSES = [
  {
    name: 'Hatha',
    body: 'Held postures, steady breath and time to feel each shape. The foundation of everything we teach.',
    level: 'All levels',
    length: '75 min'
  },
  {
    name: 'Vinyasa flow',
    body: 'Breath-led sequences that move and build warmth. Stronger work, never hurried.',
    level: 'Some practice',
    length: '60 min'
  },
  {
    name: 'Breathwork',
    body: 'Guided breathing to settle a busy mind. Seated on a cushion, no flexibility needed.',
    level: 'All levels',
    length: '45 min'
  },
  {
    name: 'Yin and sound',
    body: 'Long, supported holds on bolsters, with singing bowls and silence. Made for the evening.',
    level: 'All levels',
    length: '90 min'
  },
  {
    name: 'Pranayama for beginners',
    body: 'Four weeks on the basics of breath: counting, pausing, noticing. You leave with a practice to keep.',
    level: 'New to practice',
    length: '4 weeks, 45 min'
  }
]

export const FIRST_VISIT = [
  ['Arrive fifteen minutes early', 'Tea on the veranda, a short form, and a look around the room.'],
  ['Tell us about your body', 'Old injuries, stiff mornings, a bad back. Your teacher adjusts the class to you.'],
  ['Bring only yourself', 'Mats, bolsters, blankets and filtered water are all here. Wear something loose.']
]

export const TEAM = ['Lead teacher, Hatha and pranayama', 'Flow teacher, Vinyasa', 'Sound and Yin guide']

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const TIMETABLE = [
  [['7:00', 'Hatha'], ['18:00', 'Breathwork']],
  [['7:00', 'Vinyasa flow'], ['18:30', 'Yin and sound']],
  [['7:00', 'Hatha'], ['18:00', 'Pranayama for beginners']],
  [['7:00', 'Vinyasa flow'], ['18:30', 'Yin and sound']],
  [['7:00', 'Hatha'], ['18:00', 'Breathwork']],
  [['8:00', 'Vinyasa flow'], ['17:30', 'Yin and sound at sunset']],
  [['8:00', 'Breathwork'], null]
]

export const PRICES = [
  {
    name: 'Drop-in',
    price: '900',
    unit: 'one class',
    points: ['Any class on the timetable', 'Mat and props included', 'Pay at the door or online']
  },
  {
    name: '10-class pack',
    price: '7,500',
    unit: 'valid 90 days',
    points: ['Works out to ₹750 a class', 'Share it with one friend', 'Pause it once for travel'],
    featured: true
  },
  {
    name: 'Monthly unlimited',
    price: '8,500',
    unit: 'per month',
    points: ['Every class, every day', 'Beginner course included', 'One free guest pass a month']
  }
]
