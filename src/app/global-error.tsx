'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="hu">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <h2>Hiba tortent</h2>
        <pre style={{ whiteSpace: 'pre-wrap', color: 'red' }}>
          {error.message}
          {'\n'}
          {error.stack}
        </pre>
        <button onClick={() => reset()}>Ujraprobalas</button>
      </body>
    </html>
  )
}
