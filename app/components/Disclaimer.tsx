export function Disclaimer() {
  return (
    <p className="mx-auto max-w-3xl px-4 pb-10 text-center text-xs leading-relaxed text-gray-400">
      Not affiliated with Abstract. Tier user counts come from{' '}
      <a
        href="https://abslysis.xyz"
        target="_blank"
        rel="noreferrer"
        className="underline hover:text-gray-600"
      >
        abslysis.xyz
      </a>
      , an independent, unofficial fan project — Abstract does not publish a public API for
      aggregate tier counts. Figures are best-effort and accuracy is not guaranteed.
    </p>
  )
}
