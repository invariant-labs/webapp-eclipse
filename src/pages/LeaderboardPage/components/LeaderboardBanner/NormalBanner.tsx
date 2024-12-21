import { Box } from '@mui/material'
import icons from '@static/icons'
import { colors, typography } from '@static/theme'
import { useNavigate } from 'react-router-dom'

interface INormalBannerProps {
  onClose: () => void
  isHiding: boolean
}

export const NormalBanner = ({ onClose, isHiding }: INormalBannerProps) => {
  const navigate = useNavigate()

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: '-1px',
        left: 0,
        zIndex: 1000,
        background: colors.invariant.light,
        width: '100%',
        maxWidth: '100%',
        height: '32px',
        display: 'flex',
        ...typography.body1,
        justifyContent: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        color: colors.invariant.text,
        overflow: 'hidden',
        opacity: isHiding ? 0 : 1,
        transition: 'all 0.3s ease-in-out',
        willChange: 'height,padding,margin'
      }}>
      <span
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          transform: isHiding ? 'translateY(100%)' : 'translateY(0)',
          transition: 'transform 0.3s ease-in-out'
        }}>
        <img
          src={icons.airdrop}
          style={{
            marginRight: '12px',
            height: '24px',
            width: '24px'
          }}
        />
        <span>
          Invariant Points are available now! Check out your progress and rewards
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
        </span>
      </span>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          right: '10px',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          color: colors.invariant.text
        }}
        onClick={onClose}>
        <img width={11} src={icons.closeSmallIcon} alt='Close'></img>
      </Box>
    </Box>
  )
}
