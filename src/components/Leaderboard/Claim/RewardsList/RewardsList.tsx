import React from 'react'
import { useStylesList } from './style'
import { Grid, Typography, useMediaQuery } from '@mui/material'
import { PublicKey } from '@solana/web3.js'
import { rewards } from '@store/consts/static'
import RewardItem from './RewardItem'
import { theme } from '@static/theme'
import Scrollbars from 'rc-scrollbars'

export interface NFTsListInterface {
  userAddress: PublicKey
  isConnected?: boolean
}

const NFTsList: React.FC<NFTsListInterface> = ({ userAddress, isConnected }) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const { classes } = useStylesList()

  return (
    <div className={classes.container}>
      <Typography className={classes.historyLabel}>History of Prizes</Typography>
      {isMobile ? (
        <Grid container className={classes.rewardWrapper}>
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
      ) : (
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
          <Grid container className={classes.list}>
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
        </Scrollbars>
      )}
    </div>
  )
}
export default NFTsList
