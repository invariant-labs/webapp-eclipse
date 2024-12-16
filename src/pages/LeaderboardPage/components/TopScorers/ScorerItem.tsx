import { BN } from '@coral-xyz/anchor'
import { Box, Typography } from '@mui/material'
import { LEADERBOARD_DECIMAL } from '@pages/LeaderboardPage/config'
import { PublicKey } from '@solana/web3.js'
import { shortenAddress } from '@utils/uiUtils'
import { trimZeros, printBN } from '@utils/utils'
import React from 'react'
import useStyles from './styles'

import leaderboardGolden from '@static/svg/leaderboardGolden.svg'
import leaderboardSilver from '@static/svg/leaderboardSilver.svg'
import leaderboardBronze from '@static/svg/leaderboardBronze.svg'
import { theme } from '@static/theme'

interface IScorerItemProps {
  points: BN
  address: PublicKey
  cupVariant: 'gold' | 'silver' | 'bronze'
}

export const ScorerItem: React.FC<IScorerItemProps> = ({ address, points, cupVariant }) => {
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
    <Box className={classes.topScorersItem}>
      <Box sx={{ display: { sm: 'none', md: 'block' } }}>
        <img src={getIconByCupVariant()} alt={cupVariant} />
      </Box>
      <Box className={classes.topScorersItemBox}>
        <Box sx={{ display: { sm: 'block', md: 'none' } }}>
          <img
            src={getIconByCupVariant()}
            alt={cupVariant}
            style={{
              height: '110px',
              [theme.breakpoints.down('md')]: {
                height: '85px'
              }
            }}
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            width: '100%'
          }}>
          <Typography className={classes.headerBigText}>
            {trimZeros(printBN(new BN(points, 'hex'), LEADERBOARD_DECIMAL))} Points
          </Typography>
          <Typography className={classes.headerSmallText}>
            {shortenAddress(address.toString(), 4)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
