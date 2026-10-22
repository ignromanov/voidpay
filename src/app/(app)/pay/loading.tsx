/**
 * /pay — server-streamed loading state (QW4, spec 095).
 *
 * Shown during cold-start before PayWorkspace hydrates. Keeps the OLED screen
 * from staying black while brotli-wasm and the codec initialise.
 */
export default function PayLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
    </div>
  )
}
