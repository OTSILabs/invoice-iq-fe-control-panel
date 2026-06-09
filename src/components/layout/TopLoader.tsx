import { useIsFetching } from "@tanstack/react-query"

/**
 * Renders a top-of-page loading bar while any React Query fetch is in-flight.
 * Requires `animate-top-loader` defined in your Tailwind config.
 */
export function TopLoader() {
  const isFetching = useIsFetching()
  if (isFetching === 0) return null

  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 h-[3px] w-full bg-primary z-50 animate-top-loader"
    />
  )
}
