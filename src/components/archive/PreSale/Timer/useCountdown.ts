// import { useState, useEffect } from 'react'

// interface CountdownTime {
//   hours: string
//   minutes: string
//   seconds: string
//   isExpired: boolean
// }

// interface UseCountdownProps {
//   targetDate: Date | string | number
//   onExpire?: () => void
// }

// export const useCountdown = ({ targetDate, onExpire }: UseCountdownProps): CountdownTime => {
//   const [timeLeft, setTimeLeft] = useState<CountdownTime>({
//     hours: '00',
//     minutes: '00',
//     seconds: '00',
//     isExpired: false
//   })
//   useEffect(() => {
//     const calculateTimeLeft = () => {
//       const now = new Date().getTime()
//       const target = new Date(targetDate).getTime()
//       const difference = target - now

//       if (difference <= 0) {
//         if (!timeLeft.isExpired) {
//           setTimeLeft({
//             hours: '00',
//             minutes: '00',
//             seconds: '00',
//             isExpired: true
//           })

//           if (onExpire) {
//             onExpire()
//           }
//         }
//         return true
//       }

//       const totalSeconds = Math.floor(difference / 1000)
//       const hours = Math.floor(totalSeconds / 3600)
//       const minutes = Math.floor((totalSeconds % 3600) / 60)
//       const seconds = totalSeconds % 60

//       const newHours = hours.toString().padStart(2, '0')
//       const newMinutes = minutes.toString().padStart(2, '0')
//       const newSeconds = seconds.toString().padStart(2, '0')

//       if (
//         newHours !== timeLeft.hours ||
//         newMinutes !== timeLeft.minutes ||
//         newSeconds !== timeLeft.seconds ||
//         timeLeft.isExpired
//       ) {
//         setTimeLeft({
//           hours: newHours,
//           minutes: newMinutes,
//           seconds: newSeconds,
//           isExpired: false
//         })
//       }

//       return false
//     }

//     const isExpired = calculateTimeLeft()

//     let timer: NodeJS.Timeout | null = null
//     if (!isExpired) {
//       timer = setInterval(calculateTimeLeft, 1000)
//     }

//     return () => {
//       if (timer) {
//         clearInterval(timer)
//       }
//     }
//   }, [targetDate, onExpire])

//   return timeLeft
// }
