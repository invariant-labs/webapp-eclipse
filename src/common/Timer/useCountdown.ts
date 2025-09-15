import { useState, useEffect } from 'react'

interface CountdownTime {
  days: string
  hours: string
  minutes: string
  seconds: string
  isExpired: boolean
  displayString: string
}

interface UseCountdownProps {
  targetDate: Date | string | number
  onExpire?: () => void
}

export const useCountdown = ({ targetDate, onExpire }: UseCountdownProps): CountdownTime => {
  const [timeLeft, setTimeLeft] = useState<CountdownTime>({
    days: '00',
    hours: '00',
    minutes: '00',
    seconds: '00',
    isExpired: false,
    displayString: '00:00:00'
  })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = new Date(targetDate).getTime()
      const difference = target - now

      if (difference <= 0) {
        if (!timeLeft.isExpired) {
          setTimeLeft({
            days: '00',
            hours: '00',
            minutes: '00',
            seconds: '00',
            isExpired: true,
            displayString: '00:00:00'
          })

          if (onExpire) {
            onExpire()
          }
        }
        return true
      }

      const totalSeconds = Math.floor(difference / 1000)
      const days = Math.floor(totalSeconds / (3600 * 24))
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      const newDays = days.toString().padStart(2, '0')
      const newHours = hours.toString().padStart(2, '0')
      const newMinutes = minutes.toString().padStart(2, '0')
      const newSeconds = seconds.toString().padStart(2, '0')

      const parts: string[] = []
      if (days > 0) {
        parts.push(`${newDays}D`)
      }
      if (days > 0 || hours > 0) {
        parts.push(`${newHours}H`)
      }
      if (days > 0 || hours > 0 || minutes > 0) {
        parts.push(`${newMinutes}M`)
      }
      parts.push(`${newSeconds}S`)

      const displayString = parts.join(' : ')

      if (
        newDays !== timeLeft.days ||
        newHours !== timeLeft.hours ||
        newMinutes !== timeLeft.minutes ||
        newSeconds !== timeLeft.seconds ||
        timeLeft.isExpired
      ) {
        setTimeLeft({
          days: newDays,
          hours: newHours,
          minutes: newMinutes,
          seconds: newSeconds,
          isExpired: false,
          displayString
        })
      }

      return false
    }

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
