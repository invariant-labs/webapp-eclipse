import React from 'react'
import { useStylesList } from './style'
import { Grid, Typography } from '@mui/material'
import useIsMobile from '@store/hooks/isMobile'
import { PublicKey } from '@solana/web3.js'
import { rewards } from '@store/consts/static'
import RewardItem from './RewardItem'
import { colors, typography } from '@static/theme'

export interface NFTsListInterface {
  userAddress: PublicKey
  isConnected?: boolean
}

const NFTsList: React.FC<NFTsListInterface> = ({ userAddress, isConnected }) => {
  const isMobile = useIsMobile()
  const { classes } = useStylesList()

  return (
    <div className={classes.container}>
      <Typography mb={3} style={{ ...typography.heading4, color: colors.invariant.text }}>
        History of Prizes
      </Typography>

      <Grid container justifyContent='center' alignItems='center' gap={3} mb={isMobile ? 0 : 2}>
        {rewards.map((reward, index) => (
          <RewardItem
            key={index}
            number={index + 1}
            reward={reward}
            userAddress={userAddress.toString()}
            isConnected={isConnected}
          />
        ))}
      </Grid>
    </div>
  )
}
export default NFTsList
