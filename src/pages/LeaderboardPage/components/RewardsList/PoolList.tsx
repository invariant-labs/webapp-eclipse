import React from 'react'
import { useStylesList } from './style'
import { Grid } from '@mui/material'
import Scrollbars from 'rc-scrollbars'
import useIsMobile from '@store/hooks/isMobile'
import { PublicKey } from '@solana/web3.js'
import { rewards } from '@store/consts/static'
import RewardItem from './RewardItem'

export interface NFTsListInterface {
  userAddress: PublicKey
}

const NFTsList: React.FC<NFTsListInterface> = ({ userAddress }) => {
  const { classes } = useStylesList({
    isMobile: useIsMobile()
  })

  return (
    <div className={classes.container}>
      <Scrollbars
        style={{ maxWidth: 1072, height: 1064, overflowX: 'hidden' }}
        className={classes.scrollbar}
        autoHide
        universal
        classes={{
          thumbVertical: classes.scrollbarThumb,
          trackVertical: classes.scrollbarTrack,

          view: classes.scrollbarView
        }}>
        <Grid
          container
          justifyContent='center'
          alignItems='center'
          gap={3}
          className={classes.list}>
          {rewards.map((nft, index) => (
            <RewardItem
              key={index}
              number={index + 1}
              nft={nft}
              userAddress={userAddress.toString()}
            />
          ))}
        </Grid>
      </Scrollbars>
    </div>
  )
}
export default NFTsList
