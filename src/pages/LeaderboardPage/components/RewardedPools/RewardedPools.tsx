import { Box, Typography } from '@mui/material'
import useStyles from './styles'
import React from 'react'
import PoolList from '../PoolList/PoolList'
import { NetworkType } from '@store/consts/static'
import { VariantType } from 'notistack'

interface IProps {
  network: NetworkType
  copyAddressHandler: (message: string, variant: VariantType) => void
}

const data = [
  {
    symbolFrom: 'BTC',
    symbolTo: 'USDC',
    iconFrom:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E/logo.png',
    iconTo:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    volume: 3002.4589695555414,
    TVL: 7137.911086153499,
    fee: 0.01,
    lockedX: 2673.914699117721,
    lockedY: 2426.1845704032557,
    liquidityX: 2450.3091202791084,
    liquidityY: 3311.2738485696436,
    addressFrom: '2F5TprcNBqj2hXVr9oTssabKdf8Zbsf9xStqWjPm8yLo',
    addressTo: '5gFSyxjNsuQsZKn9g5L9Ky3cSUvJ6YXqWVuPzmSi8Trx',
    apy: 83.69386208883047,
    apyData: {
      fees: 10,
      accumulatedFarmsAvg: 10,
      accumulatedFarmsSingleTick: 10
    },
    isUnknownFrom: false,
    isUnknownTo: false,
    poolAddress: '6W8Q5K4ZMx7fAbT2SpcysQ3CahUhX2TPaMFrzmSp3MM6'
  }
]
export const RewardedPools: React.FC<IProps> = ({ network, copyAddressHandler }: IProps) => {
  const { classes } = useStyles()

  return (
    <>
      <Typography className={classes.leaderboardHeaderSectionTitle}>Rewarded Pools</Typography>

      <Box className={classes.sectionContent} width={'100%'}>
        <PoolList
          data={data}
          network={network}
          copyAddressHandler={copyAddressHandler}
          isLoading={false}
          showAPY={true}
        />
      </Box>
    </>
  )
}
