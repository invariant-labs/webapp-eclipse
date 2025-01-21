import React from 'react'
import { useStylesList } from './style'
import { Grid } from '@mui/material'
import NFTItem from './NFTItem'
import Scrollbars from 'rc-scrollbars'
import useIsMobile from '@store/hooks/isMobile'

export interface NFT {
  name: string
  image: string
  distributionDate: string
  eligible: number
}

export interface NFTsListInterface {}

const NFTsList: React.FC<NFTsListInterface> = () => {
  const { classes } = useStylesList({
    isMobile: useIsMobile()
  })

  const userAddress = 'BtGH2WkM1oNyPVgzYT51xV2gJqHhVQ4QiGwWirBUW5xN'

  const nftArray: NFT[] = [
    {
      name: 'moon',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2025-05-27',
      eligible: 100
    },
    {
      name: 'NFT2',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2023-05-27',
      eligible: 25
    },
    {
      name: 'moon',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2023-05-27',
      eligible: 10
    },
    {
      name: 'NFT4',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2023-05-27',
      eligible: 1000
    },
    {
      name: 'NFT5',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2023-05-27',
      eligible: 600
    }
  ]

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
          {nftArray.map((nft, index) => (
            <NFTItem key={index} number={index + 1} nft={nft} userAddress={userAddress} />
          ))}
        </Grid>
      </Scrollbars>
    </div>
  )
}
export default NFTsList
