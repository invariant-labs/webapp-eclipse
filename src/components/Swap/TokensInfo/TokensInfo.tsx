import React from 'react'
import { Grid } from '@mui/material'
import { useWrapperStyles } from './styles'
import SingleToken from './SingleToken/SingleToken'
import { SwapToken } from '@store/selectors/solanaWallet'
import { VariantType } from 'notistack'
import { NetworkType } from '@store/consts/static'
import classNames from 'classnames'

interface IProps {
  tokenFrom: SwapToken | null
  tokenTo: SwapToken | null
  network: NetworkType
  tokenToPrice?: number
  tokenFromPrice?: number
  copyTokenAddressHandler: (message: string, variant: VariantType) => void
  isPairGivingPoints: boolean
}

const TokensInfo: React.FC<IProps> = ({
  tokenFrom,
  tokenTo,
  network,
  tokenToPrice,
  tokenFromPrice,
  copyTokenAddressHandler,
  isPairGivingPoints
}) => {
  const { classes } = useWrapperStyles()

  return (
    <Grid className={classNames(classes.wrapper, isPairGivingPoints && classes.darkBackground)}>
      <SingleToken
        token={tokenFrom}
        tokenPrice={tokenFromPrice}
        copyTokenAddressHandler={copyTokenAddressHandler}
        network={network}
      />
      <div className={classes.divider} />
      <SingleToken
        token={tokenTo}
        tokenPrice={tokenToPrice}
        copyTokenAddressHandler={copyTokenAddressHandler}
        network={network}
      />
    </Grid>
  )
}

export default TokensInfo
