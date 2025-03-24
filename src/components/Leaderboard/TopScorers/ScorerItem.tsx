import React, { useState } from 'react'
import { BN } from '@coral-xyz/anchor'
import { Box, Skeleton, Typography } from '@mui/material'
import { shortenAddress } from '@utils/uiUtils'
import { printBN, formatNumberWithCommas } from '@utils/utils'
import leaderboardGolden from '@static/svg/leaderboardGolden.svg'
import leaderboardSilver from '@static/svg/leaderboardSilver.svg'
import leaderboardBronze from '@static/svg/leaderboardBronze.svg'
import { theme } from '@static/theme'
import useStyles from './styles'
import { LEADERBOARD_DECIMAL } from '@store/consts/static'

interface IScorerItemProps {
  points: string
  address: string
  cupVariant: 'gold' | 'silver' | 'bronze'
  showPlaceholder: boolean
  domain?: string
}

interface ImageWithPlaceholderProps {
  src: string
  alt: string
  style?: React.CSSProperties
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({ src, alt, style }) => {
  const [isLoading, setIsLoading] = useState(true)

  return (
    <Box sx={{ position: 'relative' }}>
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            '@keyframes pulse': {
              '0%, 100%': {
                opacity: 1
              },
              '50%': {
                opacity: 0.5
              }
            },
            width: style?.width || '100%',
            height: style?.height || '100%'
          }}
        />
      )}
      <Box
        component='img'
        src={src}
        alt={alt}
        sx={{
          ...style,
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 300ms'
        }}
        onLoad={() => setIsLoading(false)}
        rel='preload'
      />
    </Box>
  )
}

export const ScorerItem: React.FC<IScorerItemProps> = ({
  points,
  address,
  cupVariant,
  showPlaceholder,
  domain
}) => {
  const { classes } = useStyles()
  const getIconByCupVariant = () => {
    switch (cupVariant) {
      case 'gold':
        return leaderboardGolden
      case 'silver':
        return leaderboardSilver
      case 'bronze':
        return leaderboardBronze
    }
  }
  return (
    <>
      {showPlaceholder ? (
        <Skeleton variant='rounded' animation='wave' className={classes.skeleton} />
      ) : (
        <Box className={classes.topScorersItem}>
          <Box sx={{ display: { xs: 'none', lg: 'block' } }}>
            <ImageWithPlaceholder
              src={getIconByCupVariant()}
              alt={cupVariant}
              style={{ height: '150px', width: 'auto' }}
            />
          </Box>
          <Box className={classes.topScorersItemBox}>
            <Box sx={{ display: { sm: 'block', lg: 'none' } }}>
              <ImageWithPlaceholder
                src={getIconByCupVariant()}
                alt={cupVariant}
                style={{
                  height: '110px',
                  [theme.breakpoints.down('lg')]: {
                    height: '85px'
                  }
                }}
              />
            </Box>
            <Box className={classes.headerWrapper}>
              <Typography className={classes.headerBigText}>
                {formatNumberWithCommas(
                  Number(printBN(new BN(points, 'hex'), LEADERBOARD_DECIMAL)).toFixed(2)
                )}{' '}
                Points
              </Typography>
              <Typography className={classes.headerSmallText}>
                {domain ? domain : shortenAddress(address.toString(), 4)}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}
    </>
  )
}

export default ScorerItem
