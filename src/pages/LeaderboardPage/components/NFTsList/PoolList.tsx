import React, { useEffect } from 'react'
import PoolListItem from '../PoolListItem/PoolListItem'
import { useStyles } from './style'
import { Grid, useMediaQuery } from '@mui/material'
import { NetworkType } from '@store/consts/static'
import { VariantType } from 'notistack'
import classNames from 'classnames'
import { CustomPoolListItem } from '../PoolListItem/Variants/CustomPoolListItem'
import { theme } from '@static/theme'
import NFTItem from './NFTItem'

export interface NFT {
  name: string
  image: string
  distributionDate: string
  eligible: number
}

export interface NFTsListInterface {}

const NFTsList: React.FC<NFTsListInterface> = () => {
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
    <Grid container justifyContent='center' alignItems='center' gap={3} mt={9}>
      {nftArray.map((nft, index) => (
        <NFTItem number={index + 1} nft={nft} userPosition={userPosition} />
      ))}
    </Grid>
  )
}
export default NFTsList
