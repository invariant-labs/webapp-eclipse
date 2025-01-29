import React, { useEffect, useMemo, useState } from 'react'
import { Button, Grid, Typography } from '@mui/material'
import icons from '@static/icons'
import classNames from 'classnames'
import { Token } from '@components/OverviewYourPositions/types/types'
import { useStyles } from './styles'
import { Tick } from '@invariant-labs/sdk-eclipse/lib/market'
import { useDispatch, useSelector } from 'react-redux'
import { singlePositionData } from '@store/selectors/positions'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { formatNumber, printBN } from '@utils/utils'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getEclipseWallet } from '@utils/web3/wallet'
import { actions } from '@store/reducers/positions'
import { usePositionTicks } from '@components/OverviewYourPositions/hooks/usePositionTicks'
import { usePrices } from '@components/OverviewYourPositions/hooks/usePrices'
import { useLiquidity } from '@components/OverviewYourPositions/hooks/useLiquidity'
import { IWallet } from '@invariant-labs/sdk-eclipse'

interface PositionTicks {
  lowerTick: Tick | undefined
  upperTick: Tick | undefined
  loading: boolean
}

export interface UnclaimedFeeItemProps {
  type: 'header' | 'item'
  data?: {
    id: string
    index: number
    tokenX: Token
    tokenY: Token
    fee: number
  }
  onValueUpdate?: (id: string, value: number, unclaimedFee: number) => void

  hideBottomLine?: boolean
}

export const UnclaimedFeeItem: React.FC<UnclaimedFeeItemProps> = ({
  type,
  data,
  hideBottomLine,
  onValueUpdate
}) => {
  const { classes } = useStyles()
  const [positionTicks, setPositionTicks] = useState<PositionTicks>({
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  })

  const dispatch = useDispatch()
  const [showFeesLoader, setShowFeesLoader] = useState(true)

  const position = useSelector(singlePositionData(data?.id ?? ''))
  const wallet = getEclipseWallet()
  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)
  const { tokenXLiquidity, tokenYLiquidity } = useLiquidity(position)

  const { tokenXPriceData, tokenYPriceData } = usePrices({ data })
  const {
    lowerTick,
    upperTick,
    loading: ticksLoading
  } = usePositionTicks({
    positionId: data?.id,
    poolData: position?.poolData,
    lowerTickIndex: position?.lowerTickIndex ?? 0,
    upperTickIndex: position?.upperTickIndex ?? 0,
    networkType,
    rpc,
    wallet: wallet as IWallet
  })

  useEffect(() => {
    setPositionTicks({
      lowerTick,
      upperTick,
      loading: ticksLoading
    })
  }, [lowerTick, upperTick, ticksLoading])

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }

  const [_tokenXClaim, _tokenYClaim, unclaimedFeesInUSD] = useMemo(() => {
    if (
      !positionTicks.loading &&
      position?.poolData &&
      typeof positionTicks.lowerTick !== 'undefined' &&
      typeof positionTicks.upperTick !== 'undefined'
    ) {
      const [bnX, bnY] = calculateClaimAmount({
        position,
        tickLower: positionTicks.lowerTick,
        tickUpper: positionTicks.upperTick,
        tickCurrent: position.poolData.currentTickIndex,
        feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
        feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
      })

      const xAmount = +printBN(bnX, position.tokenX.decimals)
      const yAmount = +printBN(bnY, position.tokenY.decimals)

      const xValueInUSD = xAmount * tokenXPriceData.price
      const yValueInUSD = yAmount * tokenYPriceData.price
      const totalValueInUSD = xValueInUSD + yValueInUSD

      setShowFeesLoader(false)

      return [xAmount, yAmount, totalValueInUSD]
    }

    return [0, 0, 0]
  }, [position, positionTicks, tokenXPriceData.price, tokenYPriceData.price])

  const isLoading = showFeesLoader || tokenXPriceData.loading || tokenYPriceData.loading
  const tokenValueInUsd = useMemo(() => {
    if (!tokenXLiquidity && !tokenYLiquidity) {
      return 0
    }

    const totalValueOfTokensInUSD =
      tokenXLiquidity * tokenXPriceData.price + tokenYLiquidity * tokenYPriceData.price

    console.log('Price:' + tokenXPriceData.price)
    console.log('Liq:' + tokenXLiquidity)
    return totalValueOfTokensInUSD
  }, [data?.tokenX, data?.tokenY])
  useEffect(() => {
    if (data?.id && !isLoading) {
      const currentValue = tokenValueInUsd
      const currentUnclaimedFee = unclaimedFeesInUSD
      onValueUpdate?.(data.id, currentValue, currentUnclaimedFee)
    }
  }, [data?.id, tokenValueInUsd, unclaimedFeesInUSD, isLoading, onValueUpdate])
  return (
    <Grid
      container
      className={classNames(classes.container, type === 'header' ? classes.header : classes.item, {
        [classes.noBottomBorder]: hideBottomLine
      })}>
      <Typography component='p' style={{ alignSelf: 'center' }}>
        {type === 'header' ? (
          <>
            N<sup>o</sup>
          </>
        ) : (
          data?.index
        )}
      </Typography>

      <Typography style={{ alignSelf: 'center', display: 'flex' }}>
        {type === 'header' ? (
          'Name'
        ) : (
          <>
            <div className={classes.icons}>
              <img
                className={classes.tokenIcon}
                src={data?.tokenX.icon}
                alt={data?.tokenX.name}
                onError={handleImageError}
              />
              <img
                className={classes.tokenIcon}
                src={data?.tokenY.icon}
                alt={data?.tokenY.name}
                onError={handleImageError}
              />
            </div>
            {`${data?.tokenX.name}/${data?.tokenY.name}`}
          </>
        )}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header' ? 'Fee' : `${data?.fee.toFixed(2)}%`}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header' ? 'Value' : `$${formatNumber(tokenValueInUsd.toFixed(6))}`}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header'
          ? 'Unclaimed fee'
          : isLoading
            ? 'Loading...'
            : `$${unclaimedFeesInUSD.toFixed(6)}`}
      </Typography>

      <Grid container justifyContent='flex-end' alignItems='center'>
        {type === 'header' ? (
          <Typography>Action</Typography>
        ) : (
          <Button
            className={classes.claimButton}
            onClick={() => {
              if (!position) return undefined
              setShowFeesLoader(true)
              dispatch(
                actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked })
              )
            }}
            disabled={isLoading || unclaimedFeesInUSD === 0}>
            {isLoading ? 'Loading...' : 'Claim fee'}
          </Button>
        )}
      </Grid>
    </Grid>
  )
}
