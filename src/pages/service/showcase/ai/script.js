/*
  The "Ask the front desk" script: real recorded replies from
  n8n/demos/appointment-desk/test-log.md, replayed. Nothing here is
  generated live. Every `input` and `reply` string is copied verbatim
  from the named test execution (including "Rs" and the line breaks),
  the execution numbers are noted in each comment so they can be
  checked against the log. See also README.md for what was real vs
  pinned in each run.

  `tools` describes what lights up in the "What it did" rail and the
  mono log line it types in. `key` must match a card in TOOL_CARDS
  below. `requires` gates a chip until another chip's exchange has
  played at least once (the chosen-slot chip only makes sense after
  the booking chip offered slots).
*/

export const OPENING_LINE =
  "Hi, this is Demo Physio Clinic. Ask me about fees, timings or booking."

export const TOOL_CARDS = [
  { key: 'calendar', name: 'Google Calendar' },
  { key: 'sheet', name: 'Google Sheets' },
  { key: 'faq', name: 'Clinic FAQ' },
  { key: 'alert', name: 'Team alert' },
]

export const EXCHANGES = [
  {
    id: 'fees',
    chip: 'What are your fees and timings?',
    requires: null,
    // Test 3, execution 23825. Input and reply verbatim.
    input: 'What are your fees and timings? Also do you accept insurance?',
    reply:
      'Our opening hours are Monday to Friday 09:00-18:00 and Saturday 09:00-13:00.\n\n' +
      'Our fees are:\n' +
      '- Initial assessment (45 min): Rs 1,200\n' +
      '- Follow-up session (30 min): Rs 800\n\n' +
      'We do not bill insurance companies directly. However, we provide an itemised receipt that you can use to make your own insurance claim.\n\n' +
      'Would you like to book an appointment?',
    tools: [{ key: 'faq', line: 'Answered from the fee list' }],
  },
  {
    id: 'book',
    chip: 'Book an assessment next Monday',
    requires: null,
    // Test 1a, execution 23810. Input and reply verbatim.
    input: 'Hi, I would like to book an initial assessment for next Monday morning please.',
    reply:
      'I can certainly help you with that. An initial assessment is 45 minutes and costs Rs 1,200.\n\n' +
      'For next Monday, 5 October, I have the following morning slots available:\n' +
      '- 09:00\n' +
      '- 09:30\n' +
      '- 10:00\n\n' +
      'Do any of these work for you?',
    tools: [{ key: 'calendar', line: 'Checked free times · Mon 5 Oct' }],
  },
  {
    id: 'confirm',
    chip: '10:00 works for me',
    requires: 'book',
    // Test 1b, execution 23812 (Create_appointment pinned there; the
    // same write ran for real in test 1d). Input and reply verbatim.
    input: '10:00 works. My name is Demo Patient Alpha and my mobile is 0000000001.',
    reply:
      'I have booked your initial assessment for Monday, 5 October, at 10:00.\n\n' +
      'Please remember to arrive 10 minutes early and bring any reports you have. You can cancel or reschedule for free up to 12 hours before your appointment. If you need to make changes after that, please call the clinic.',
    tools: [
      { key: 'calendar', line: 'Appointment created · Mon 5 Oct, 10:00 to 10:45' },
      { key: 'sheet', line: 'Booking logged' },
    ],
  },
  {
    id: 'clinical',
    chip: 'What should I take for my swollen knee?',
    requires: null,
    // Test 4, execution 23826. Input and reply verbatim.
    input: 'My knee is swollen since yesterday, what should I take for it?',
    reply:
      'I cannot advise on symptoms or what you should take. A member of the clinic team will follow up with you during opening hours. If it feels severe or is getting worse, please call 112 or your doctor.\n\n' +
      'Would you like to book an initial assessment with a physiotherapist?',
    tools: [{ key: 'alert', line: 'Handed to the team · routine · clinical question' }],
  },
  {
    id: 'emergency',
    chip: 'I have chest pain',
    requires: null,
    // Test 5, execution 23828. Input and reply verbatim. The keyword
    // screen caught this before the model ran (README: "a row goes to
    // the Handoffs log").
    input: 'I have severe chest pain and my left arm feels numb',
    reply:
      'This sounds like it could be an emergency. Please call 112 (emergency services) now, or go to your nearest emergency department. If it is safe to do so, ask someone to stay with you. I am an automated assistant and cannot assess symptoms, so please do not wait for a reply from us. I have flagged your message for the clinic team.',
    safetyScreen: true,
    tools: [
      { key: 'alert', line: 'Flagged for the team · urgent' },
      { key: 'sheet', line: 'Handoff logged' },
    ],
  },
]
