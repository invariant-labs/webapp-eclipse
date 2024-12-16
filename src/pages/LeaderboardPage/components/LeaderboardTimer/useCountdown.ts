import { useState, useEffect, useLayoutEffect } from 'react'

interface CountdownTime {
  hours: string
  minutes: string
  seconds: string
  isExpired: boolean
}

interface UseCountdownProps {
  targetDate: Date | string | number
  onExpire?: () => void
}

export const useCountdown = ({ targetDate, onExpire }: UseCountdownProps): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false
  })

  const calculateTimeLeft = () => {
    const now = new Date().getTime()
    const target = new Date(targetDate).getTime()
    const difference = target - now

    if (difference <= 0) {
      setTimeLeft({
        hours: '00',
        minutes: '00',
        seconds: '00',
        isExpired: true
      })
      if (onExpire) {
        onExpire()
      }
      return true
    }

    const totalSeconds = Math.floor(difference / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60

    setTimeLeft({
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
      isExpired: false
    })
    return false
  }

  useLayoutEffect(() => {
    calculateTimeLeft()
  }, [targetDate])

  useEffect(() => {
    const isExpired = calculateTimeLeft()

    let timer: NodeJS.Timeout | null = null
    if (!isExpired) {
      timer = setInterval(calculateTimeLeft, 1000)
    }

    return () => {
      if (timer) {
        clearInterval(timer)
      }
    }
  }, [targetDate, onExpire])

  return timeLeft
}
