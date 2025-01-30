import { useState, useEffect } from 'react'

export const useDebounceLoading = (isLoading: boolean, delay: number = 500) => {
  const [debouncedLoading, setDebouncedLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isLoading) {
      // If we're going into loading state, only show it after delay
      const newTimer = setTimeout(() => {
        setDebouncedLoading(true)
      }, delay)
      setTimer(newTimer)
    } else {
      // If we're leaving loading state, clear timer and update immediately
      if (timer) {
        clearTimeout(timer)
        setTimer(null)
      }
      setDebouncedLoading(false)
    }

    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isLoading, delay])

  return debouncedLoading
}
