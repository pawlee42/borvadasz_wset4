'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h2>Hiba tortent</h2>
      <pre style={{ whiteSpace: 'pre-wrap', color: 'red' }}>
        {error.message}
        {'\n'}
        {error.stack}
      </pre>
      <button onClick={() => reset()}>Ujraprobalas</button>
    </div>
  )
}
