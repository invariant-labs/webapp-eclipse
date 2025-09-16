import { useCountdown } from '@common/Timer/useCountdown'
import { BannerState } from '@containers/LockWrapper/LockWrapper'
import { Box, Typography } from '@mui/material'
import { BannerPhase } from '@store/consts/types'

interface DynamicBannerProps {
  bannerState: BannerState
  isLoading: boolean
}

export const DynamicBanner: React.FC<DynamicBannerProps> = ({ isLoading, bannerState }) => {
  const currentTime = Math.floor(Date.now() / 1000)

  const backgroundByKey: Record<BannerPhase, string> = {
    beforeStartPhase: 'rgba(30, 226, 192, 0.2)',
    lockPhase: 'rgba(239, 208, 99, 0.2)',
    yieldPhase: 'rgba(107, 114, 128, 0.2)',
    burningPhase: 'rgba(107, 114, 128, 0.2)',
    endPhase: 'rgba(107, 114, 128, 0.2)'
  }

  const borderByKey: Record<BannerPhase, string> = {
    beforeStartPhase: '2px solid #1EE2C0',
    lockPhase: '2px solid #F0D063',
    yieldPhase: '2px solid #6b7280',
    burningPhase: '2px solid #6b7280',
    endPhase: '2px solid #6b7280'
  }

  const colorByKey: Record<BannerPhase, string> = {
    beforeStartPhase: '#1EE2C0',
    lockPhase: '#F0D063',
    yieldPhase: '#6b7280',
    burningPhase: '#6b7280',
    endPhase: '#6b7280'
  }

  const targetDate = new Date((bannerState.timestamp || 0) * 1000)

  const { displayString } = useCountdown({
    targetDate
  })

  const bannerStyles = {
    width: '100%',
    maxWidth: 1040,
    boxSizing: 'border-box',
    marginBottom: '24px',
    background: backgroundByKey[bannerState.key],
    border: borderByKey[bannerState.key],
    borderRadius: '24px',
    padding: '16px 24px',
    display: 'flex',
    gap: 1,
    opacity: isLoading ? 0 : 1,
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  return (
    <Box sx={bannerStyles}>
      <Typography sx={{ color: colorByKey[bannerState.key] }}>{bannerState.text}</Typography>
      <Typography sx={{ color: colorByKey[bannerState.key] }}>
        {bannerState.timestamp > currentTime ? displayString : ''}
      </Typography>
    </Box>
  )
}

export default DynamicBanner
