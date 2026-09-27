/*
  Keyboard handling shared by the two tab widgets on the About page (the
  stepper and the toolbox). WAI-ARIA tabs pattern with a roving tabindex:
  only the selected tab is in the Tab order, the arrow keys move between
  tabs (and select them, "automatic activation"), Home and End jump to the
  ends. Returns true when it handled the key.
*/
export function handleTabKey(event, index, count, select, orientation = 'horizontal') {
  const prev = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'
  const next = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
  let target = null
  if (event.key === prev) target = (index - 1 + count) % count
  else if (event.key === next) target = (index + 1) % count
  else if (event.key === 'Home') target = 0
  else if (event.key === 'End') target = count - 1
  if (target === null) return false

  event.preventDefault()
  select(target)
  // Move focus with the selection so the roving tabindex stays honest.
  const list = event.currentTarget.closest('[role="tablist"]')
  list?.querySelectorAll('[role="tab"]')[target]?.focus()
  return true
}
