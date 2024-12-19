import { Box } from '@mui/material'
import icons from '@static/icons'
import { colors, typography } from '@static/theme'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface ITimerBanner {
  seconds: string
  minutes: string
  hours: string
}

export const TimerBanner: React.FC<ITimerBanner> = ({ hours, minutes, seconds }) => {
  const SWITCH_INTERVAL = 4000
  const navigate = useNavigate()
  const [showTimer, setShowTimer] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setShowTimer(prev => !prev)
    }, SWITCH_INTERVAL)

    return () => clearInterval(interval)
  }, [])

  const TimerContent = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={icons.airdrop}
        style={{
          marginRight: '6px',
          height: '24px',
          width: '24px'
        }}
        alt='Airdrop icon'
      />
      <span>Invariant Points will start in</span>
      <span
        style={{
          display: 'inline-block',
          color: colors.invariant.dark,
          ...typography.body1,
          background: colors.invariant.green,
          padding: '2px',
          marginLeft: '8px',
          marginRight: '4px',
          borderRadius: '2px',
          width: '32px',
          textAlign: 'center'
        }}>
        {hours} H
      </span>
      :
      <span
        style={{
          display: 'inline-block',
          color: colors.invariant.dark,
          ...typography.body1,
          background: colors.invariant.green,
          padding: '2px',
          marginLeft: '4px',
          marginRight: '4px',
          borderRadius: '2px',
          width: '36px',
          textAlign: 'center'
        }}>
        {minutes} M
      </span>
      :
      <span
        style={{
          display: 'inline-block',
          color: colors.invariant.dark,
          ...typography.body1,
          background: colors.invariant.green,
          padding: '2px',
          marginLeft: '4px',
          borderRadius: '2px',
          width: '32px',
          textAlign: 'center'
        }}>
        {seconds} S
      </span>
    </div>
  )

  const CheckoutContent = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img
        src={icons.airdrop}
        style={{
          marginRight: '6px',
          height: '24px',
          width: '24px'
        }}
        alt='Airdrop icon'
      />
      Check it out
      <span
        style={{
          color: colors.invariant.pink,
          textDecoration: 'underline',
          marginLeft: '6px',
          cursor: 'pointer',
          ...typography.body1
        }}
        onClick={() => navigate('/points')}>
        here!
      </span>
    </div>
  )

  return (
    <Box
      sx={{
        background: colors.invariant.light,
        padding: '10px 20px',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        ...typography.body1,
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        color: colors.invariant.text,
        flexDirection: { xs: 'column', sm: 'row' },
        margin: 0
      }}>
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}></span>
      <Box
        sx={{
          position: 'relative',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '6px',
          marginRight: '6px',
          minWidth: showTimer ? '400px' : '400px',
          transition: 'min-width 0.3s ease-in-out'
        }}>
        <Box
          sx={{
            position: 'absolute',
            opacity: showTimer ? 1 : 0,
            visibility: showTimer ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
          }}>
          <TimerContent />
        </Box>
        <Box
          sx={{
            position: 'absolute',
            opacity: !showTimer ? 1 : 0,
            visibility: !showTimer ? 'visible' : 'hidden',
            transition: 'opacity 0.3s ease-in-out, visibility 0.3s ease-in-out'
          }}>
          <CheckoutContent />
        </Box>
      </Box>
    </Box>
  )
}
