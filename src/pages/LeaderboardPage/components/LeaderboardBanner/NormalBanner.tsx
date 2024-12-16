import { Box } from '@mui/material'
import icons from '@static/icons'
import { colors, typography } from '@static/theme'
import { useNavigate } from 'react-router-dom'
export const NormalBanner = () => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        background: colors.invariant.pink,
        padding: '10px 20px',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        ...typography.body1,
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        margin: 0
      }}>
      <img
        src={icons.airdrop}
        style={{
          marginRight: '6px',
          height: '24px',
          width: '24px'
        }}
      />
      Invariant Points are available now! Check out your progress and rewards
      <span
        style={{
          color: colors.invariant.text,
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
  )
}
