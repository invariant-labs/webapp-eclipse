import { Box } from '@mui/material'
import icons from '@static/icons'
import { colors, typography } from '@static/theme'
import React from 'react'
import { useNavigate } from 'react-router-dom'

interface ITimerBanner {
  seconds: string
  minutes: string
  hours: string
}

export const TimerBanner: React.FC<ITimerBanner> = ({ hours, minutes, seconds }) => {
  const navigate = useNavigate()

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
        }}>
        <img
          src={icons.airdrop}
          style={{
            marginRight: '6px',
            height: '24px',
            width: '24px'
          }}
        />
        Invariant Points will start in
      </span>
      <span style={{ marginLeft: '6px', marginRight: '6px' }}>
        <span
          style={{
            display: 'inline-block',
            color: colors.invariant.dark,
            ...typography.body1,
            background: colors.invariant.green,
            padding: '2px',
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
      </span>
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        Check it out
        <span
          style={{
            color: colors.invariant.pink,
            textDecoration: 'underline',
            marginLeft: '6px',
            cursor: 'pointer',
            ...typography.body1
          }}
          onClick={() => {
            navigate('/points')
          }}>
          here!
        </span>
      </Box>
    </Box>
  )
}
