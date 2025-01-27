import React from 'react'
import { useStylesList } from './style'
import { Grid, Typography } from '@mui/material'
import Scrollbars from 'rc-scrollbars'
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
  const { classes } = useStylesList({
    isMobile
  })

  return (
    <div className={classes.container}>
      <Typography mb={3} style={{ ...typography.heading4, color: colors.invariant.text }}>
        History of Prizes
      </Typography>
      <Scrollbars
        style={{ maxWidth: 1072, overflowX: 'hidden' }}
        className={classes.scrollbar}
        autoHide
        universal
        classes={{
          thumbVertical: classes.scrollbarThumb,
          trackVertical: classes.scrollbarTrack,
          view: classes.scrollbarView
        }}
        autoHeight
        hideTracksWhenNotNeeded
        autoHeightMax={1064}>
        <Grid
          container
          justifyContent='center'
          alignItems='center'
          gap={3}
          mb={isMobile ? 0 : 2}
          className={classes.list}>
          {rewards.map((nft, index) => (
            <RewardItem
              key={index}
              number={index + 1}
              nft={nft}
              userAddress={userAddress.toString()}
              isConnected={isConnected}
            />
          ))}
        </Grid>
      </Scrollbars>
    </div>
  )
}
export default NFTsList
