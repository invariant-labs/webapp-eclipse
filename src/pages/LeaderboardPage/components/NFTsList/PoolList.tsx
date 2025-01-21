import React from 'react'
import { useStylesList } from './style'
import { Grid } from '@mui/material'
import NFTItem from './NFTItem'
import Scrollbars from 'rc-scrollbars'

export interface NFT {
  name: string
  image: string
  distributionDate: string
  eligible: number
}

export interface NFTsListInterface {}

const NFTsList: React.FC<NFTsListInterface> = () => {
  const { classes: listClasses } = useStylesList()
  const userPosition = 56

  const nftArray: NFT[] = [
    {
      name: 'NFT1',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2023-05-27',
      eligible: 100
    },
    {
      name: 'NFT2',
      image: 'https://thenftbrief.com/wp-content/uploads/2023/05/image-27.png',
      distributionDate: '2023-05-27',
      eligible: 25
    },
    {
      name: 'NFT3',
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
    <div className={listClasses.container}>
      <Scrollbars
        style={{ maxWidth: 1072, height: 1064, overflowX: 'hidden' }}
        className={listClasses.scrollbar}
        autoHide
        universal
        classes={{
          thumbVertical: listClasses.scrollbarThumb,
          trackVertical: listClasses.scrollbarTrack,

          view: listClasses.scrollbarView
        }}>
        <Grid
          container
          justifyContent='center'
          alignItems='center'
          gap={3}
          className={listClasses.list}>
          {nftArray.map((nft, index) => (
            <NFTItem key={index} number={index + 1} nft={nft} userPosition={userPosition} />
          ))}
        </Grid>
      </Scrollbars>
    </div>
  )
}
export default NFTsList
