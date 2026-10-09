/* Shared by the AI check and the plans (flow/Steps.jsx): the step
   entrance and the email check. A plain module, so Steps.jsx exports
   only components. */
const EASE = [0.22, 1, 0.36, 1]

export const stepIn = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: EASE }
}

export const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
