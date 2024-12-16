import { Typography, Box, Button } from '@mui/material'
import { colors, typography } from '@static/theme'
import React from 'react'
import useStyles from './style'
import { useNavigate } from 'react-router-dom'

interface ITimerProps {
  hours: string
  minutes: string
  seconds: string
  handleClose: () => void
}

export const Timer: React.FC<ITimerProps> = ({ hours, minutes, seconds, handleClose }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  return (
    <>
      <Typography style={{ color: colors.invariant.text }}>
        <span style={{ color: colors.invariant.pink, textAlign: 'center' }}>Invariant Points</span>{' '}
        launches in:
      </Typography>

      <Box
        sx={{
          display: 'flex',
          textAlign: 'center',
          justifyItems: 'center',
          alignItems: 'center',
          width: '100%',
          marginTop: '8px'
        }}>
        <Box
          sx={{
            width: '57px',
            height: 'fit-content',
            padding: '6px',
            borderRadius: '4px',
            color: colors.invariant.dark,
            fontWeight: 700,
            lineHeight: '20px',
            fontSize: '24px',
            background: 'linear-gradient(360deg, #2EE09A 0%, #EF84F5 100%);'
          }}>
          {hours}H
        </Box>
        <Box sx={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <Typography style={{ ...typography.heading4, color: colors.invariant.light }}>
            :
          </Typography>
        </Box>
        <Box
          sx={{
            width: '57px',
            height: 'fit-content',
            padding: '6px',
            borderRadius: '4px',
            color: colors.invariant.dark,
            fontWeight: 700,
            lineHeight: '20px',
            fontSize: '24px',
            background: 'linear-gradient(360deg, #2EE09A 0%, #EF84F5 100%);'
          }}>
          {minutes}M
        </Box>
        <Box sx={{ paddingLeft: '2px', paddingRight: '2px' }}>
          <Typography style={{ ...typography.heading4, color: colors.invariant.light }}>
            :
          </Typography>
        </Box>
        <Box
          sx={{
            width: '57px',
            height: 'fit-content',
            padding: '6px',
            borderRadius: '4px',
            color: colors.invariant.dark,
            fontWeight: 700,
            lineHeight: '20px',
            fontSize: '24px',
            background: 'linear-gradient(360deg, #2EE09A 0%, #EF84F5 100%);'
          }}>
          {seconds}S
        </Box>
      </Box>
      <Button
        className={classes.button}
        style={{ marginTop: '16px' }}
        onClick={() => {
          handleClose()
          navigate('/points')
        }}>
        Go to Points Tab
      </Button>
    </>
  )
}
