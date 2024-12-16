import { Box, Typography } from '@mui/material'
import { UserStats } from '@store/reducers/leaderboard'
import React, { useMemo } from 'react'
import useStyles from './styles'
import { printBN, trimZeros } from '@utils/utils'

import { status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'

import trapezeLeft from '@static/png/trapezeLeft.png'
import trapezeRight from '@static/png/trapezeRight.png'

import trapezeMobileTop from '@static/png/trapezeMobileTop.png'
import trapezeMobileBottom from '@static/png/trapezeMobileBottom.png'

import { useSelector } from 'react-redux'
import { BlurOverlay } from './BlurOverlay'
import { ProgressItem } from './ProgressItem'
import { BN } from '@coral-xyz/anchor'

interface YourProgressProps {
  userStats: UserStats | null
}

export const YourProgress: React.FC<YourProgressProps> = ({ userStats }) => {
  const { classes } = useStyles()
  const walletStatus = useSelector(status)
  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        width: '100%'
      }}>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Your Progress</Typography>

      <Box className={classes.sectionContent} style={{ position: 'relative' }}>
        {/* <BlurOverlay isConnected={isConnected} /> */}
        <ProgressItem
          background={{
            dekstop: trapezeLeft,
            mobile: trapezeMobileTop
          }}
          desktopLabelAligment='right'
          label='Total points'
          value={userStats?.points ?? 0}
        />
        <ProgressItem
          background={{
            dekstop: trapezeRight,
            mobile: trapezeMobileBottom
          }}
          desktopLabelAligment='left'
          label='Global rank'
          value={userStats?.rank ?? 0}
        />
        {/* <Box
          sx={{
            boxSizing: 'border-box',
            width: '335px',
            height: '88px',
            backgroundImage: `url(${trapezeMobileBottom})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
          <Box
            sx={{
              boxSizing: 'border-box',
              width: '100%',
              height: '100%',
              paddingTop: '12px',
              paddingBottom: '12px',
              paddingLeft: '24px',
              paddingRight: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              alignItems: 'flex-start',
              justifyContent: 'flex-start'
            }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '8px'
              }}>
              <Typography className={classes.headerSmallText}>Global Rank</Typography>
              {/* <Tooltip
                    title={
                      'Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum Lorem ipsum'
                    }
                    placement='bottom'
                    classes={{
                      tooltip: classes.tooltip
                    }}>
                    <img src={infoIcon} alt='i' width={14} />
                  </Tooltip> */}
        {/* </Box>
            <Typography className={classes.headerBigText}>
              {userStats ? userStats.rank : 0}
            </Typography> */}
        {/* </Box>
        </Box> */}
      </Box>
    </Box>
  )
}
