import { useCountdown } from '@common/Timer/useCountdown'
import { BannerState } from '@containers/LockWrapper/LockWrapper'
import { Box, Typography } from '@mui/material'
import { BannerPhase } from '@store/consts/types'

interface DynamicBannerProps {
  bannerState: BannerState
}

export const DynamicBanner: React.FC<DynamicBannerProps> = ({ bannerState }) => {
  const currentTime = Math.floor(Date.now() / 1000)

  const backgroundByKey: Record<BannerPhase, string> = {
    lockEnds: 'rgba(239, 208, 99, 0.2)',
    redeemAvailable: 'rgba(107, 114, 128, 0.2)',
    burnEnds: 'rgba(107, 114, 128, 0.2)',
    ended: 'rgba(107, 114, 128, 0.2)'
  }

  const borderByKey: Record<BannerPhase, string> = {
    lockEnds: '2px solid #F0D063',
    redeemAvailable: '2px solid #6b7280',
    burnEnds: '2px solid #6b7280',
    ended: '2px solid #6b7280'
  }

  const colorByKey: Record<BannerPhase, string> = {
    lockEnds: '#F0D063',
    redeemAvailable: '#6b7280',
    burnEnds: '#6b7280',
    ended: '#6b7280'
  }

  const targetDate = new Date((bannerState.timestamp || 0) * 1000)

  const { displayString } = useCountdown({
    targetDate,
    onExpire: () => {
      console.log('Timer completed for:', bannerState.text)
    }
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
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
  }

  return (
    <Box sx={bannerStyles}>
      <Typography sx={{ color: colorByKey[bannerState.key] }}>{bannerState.text}</Typography>
      <Typography sx={{ color: colorByKey[bannerState.key] }}>
        {bannerState.timestamp > currentTime ? displayString : '00:00:00:00'}
      </Typography>
    </Box>
  )
}

export default DynamicBanner
