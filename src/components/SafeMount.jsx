import { Component } from 'react'

/*
  A minimal error boundary. Its one job here: if the 3D hero fails to
  mount — no WebGL, a driver quirk, a context-creation error that Suspense
  cannot catch — swallow it and render nothing, so the page keeps the
  photograph instead of crashing the hero. Decorative children only.
*/
export default class SafeMount extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    // Intentionally silent — the fallback (nothing) is the correct outcome
    // for a decorative enhancement that could not start.
  }

  render() {
    if (this.state.failed) return null
    return this.props.children
  }
}
