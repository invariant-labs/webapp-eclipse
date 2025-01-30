import { useState, useEffect } from 'react'

export const useDebounceLoading = (isLoading: boolean, delay: number = 500) => {
  const [debouncedLoading, setDebouncedLoading] = useState(false)
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isLoading) {
      const newTimer = setTimeout(() => {
        setDebouncedLoading(true)
      }, delay)
      setTimer(newTimer)
    } else {
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
