import { ButtonLink, Container } from '../components/ui/primitives'

export default function NotFound() {
  return (
    <Container className="flex flex-col items-center gap-5 py-32 text-center">
      <p className="text-sm font-medium text-cyan">404</p>
      <h1 className="text-h2 font-normal">We couldn't find that page.</h1>
      <p className="text-muted">It may have moved, or the link might be mistyped.</p>
      <div className="flex gap-3">
        <ButtonLink to="/">Go home</ButtonLink>
        <ButtonLink to="/solutions" variant="secondary">Browse solutions</ButtonLink>
      </div>
    </Container>
  )
}
