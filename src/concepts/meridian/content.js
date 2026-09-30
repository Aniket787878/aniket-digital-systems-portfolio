/* All visible copy for Meridian Advisory, a made-up firm in BKC, Mumbai.
   No invented results, no client names, no numbers presented as proof. */

export const NAV = [
  ['Approach', '#m-story'],
  ['Services', '#m-services'],
  ['How we work', '#m-how'],
  ['Fees', '#m-fees']
]

export const STAGES = [
  {
    key: 'Scattered',
    lines: [
      'Returns in one inbox, bank statements in another.',
      'Advance tax dates remembered the week they fall due.',
      'Investments that nobody has looked at side by side.'
    ]
  },
  {
    key: 'Gathered',
    lines: [
      'Every account, filing and holding in one place.',
      'Your company, your family and your investments seen together.',
      'One calendar with every deadline already on it.'
    ]
  },
  {
    key: 'Clear',
    lines: [
      'A written plan you can read in ten minutes.',
      'Numbers moving in the direction you chose.',
      'A review every quarter, so it stays that way.'
    ]
  }
]

export const SERVICES = [
  {
    n: '01',
    title: 'Tax filing and planning',
    body: 'Returns for individuals, HUFs and companies, filed on time. Advance tax worked out every quarter, and the year planned before it starts, not after it ends.',
    items: ['Salary, business and capital gains income', 'Advance tax schedules', 'Replies to tax notices, handled with you']
  },
  {
    n: '02',
    title: 'Company accounting and GST',
    body: 'Books kept every month, GST returns filed, and a clean set of accounts ready for your auditor, your bank and your board.',
    items: ['Monthly bookkeeping and a short report', 'GSTR-1, GSTR-3B and annual returns', 'TDS returns and company filings']
  },
  {
    n: '03',
    title: 'Wealth planning',
    body: 'A plain, written view of what you own, what each part is for, and what should change. We charge a fee for advice, so the plan is never built around selling you a product.',
    items: ['Goals, timelines and cash needs mapped', 'Holdings reviewed across all accounts', 'Changes planned with the tax in mind']
  },
  {
    n: '04',
    title: 'Family office support',
    body: 'For families with several businesses, properties and generations. One record of everything the family holds, and one team that works with your lawyers and bankers.',
    items: ['One family report every quarter', 'Succession and will planning, with your lawyer', 'Property and trust paperwork']
  }
]

export const STEPS = [
  {
    when: 'Week 0',
    title: 'Discovery call',
    body: 'Forty-five minutes, free, by phone or at our office in BKC. You tell us what feels messy. We tell you honestly whether we are the right fit.'
  },
  {
    when: 'Weeks 1 to 3',
    title: 'A full picture of where you stand',
    body: 'We gather returns, statements and filings into one view. It takes two to three weeks, depending on how many companies and accounts there are.'
  },
  {
    when: 'Week 4',
    title: 'A written plan',
    body: 'A short document in plain language: what to file, what to change, what to leave alone. Every action has a date and a name next to it.'
  },
  {
    when: 'Every quarter',
    title: 'A quarterly review',
    body: 'Every three months we sit down, check the plan against the numbers and adjust. The advance tax dates are built into the calendar.'
  }
]

export const TEAM = [
  ['Partner, chartered accountant', 'Owns your plan and chairs every review'],
  ['Tax manager', 'Returns, advance tax and notices'],
  ['Wealth planner', 'Holdings, goals and the written plan'],
  ['Client desk', 'Documents, reminders and scheduling']
]

export const TIERS = [
  {
    name: 'Individual',
    price: '48,000',
    for: 'For one person or an HUF',
    items: [
      'Income tax return and advance tax',
      'Capital gains and foreign income',
      'A tax plan at the start of the year',
      'Two review calls a year'
    ]
  },
  {
    name: 'Founder',
    price: '1,80,000',
    for: 'For you, your spouse and one company',
    featured: true,
    items: [
      'Everything in Individual, for two people',
      'Accounting, GST and TDS for one company',
      'A short monthly report on the company',
      'A review meeting every quarter'
    ]
  },
  {
    name: 'Family',
    price: '4,80,000',
    from: true,
    for: 'For up to four people and three entities',
    items: [
      'One family report every quarter',
      'A written wealth plan, updated each year',
      'Work with your lawyer and bankers',
      'A named partner for the whole family'
    ]
  }
]

/* Advance tax instalments in India: 15 Jun, 15 Sep, 15 Dec, 15 Mar, with
   15, 45, 75 and 100 percent of the year's tax due by each. */
export function nextAdvanceTax(now = new Date()) {
  const y = now.getFullYear()
  const list = [
    [new Date(y, 2, 15), 100],
    [new Date(y, 5, 15), 15],
    [new Date(y, 8, 15), 45],
    [new Date(y, 11, 15), 75],
    [new Date(y + 1, 2, 15), 100]
  ]
  const today = new Date(y, now.getMonth(), now.getDate())
  const [date, pct] = list.find(([d]) => d >= today)
  const days = Math.round((date - today) / 86400000)
  const label = date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  return { label, pct, days }
}
