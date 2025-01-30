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
import { useDebounceLoading } from '@components/OverviewYourPositions/hooks/useDebounceLoading'

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
  const dispatch = useDispatch()

  const [isClaimLoading, setIsClaimLoading] = useState(false)
  const [previousUnclaimedFees, setPreviousUnclaimedFees] = useState<number | null>(null)
  const [positionTicks, setPositionTicks] = useState<PositionTicks>({
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  })

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

      if (!isClaimLoading && totalValueInUSD > 0) {
        setPreviousUnclaimedFees(totalValueInUSD)
      }

      return [xAmount, yAmount, totalValueInUSD]
    }

    return [0, 0, previousUnclaimedFees ?? 0]
  }, [
    position,
    positionTicks,
    tokenXPriceData.price,
    tokenYPriceData.price,
    isClaimLoading,
    previousUnclaimedFees
  ])

  const rawIsLoading =
    ticksLoading || tokenXPriceData.loading || tokenYPriceData.loading || isClaimLoading
  const isLoading = useDebounceLoading(rawIsLoading)

  const tokenValueInUsd = useMemo(() => {
    if (!tokenXLiquidity && !tokenYLiquidity) {
      return 0
    }

    return tokenXLiquidity * tokenXPriceData.price + tokenYLiquidity * tokenYPriceData.price
  }, [tokenXLiquidity, tokenYLiquidity, tokenXPriceData.price, tokenYPriceData.price])

  useEffect(() => {
    if (data?.id && !isLoading) {
      onValueUpdate?.(data.id, tokenValueInUsd, unclaimedFeesInUSD)
    }
  }, [data?.id, tokenValueInUsd, unclaimedFeesInUSD, isLoading, onValueUpdate])

  const handleClaimFee = async () => {
    if (!position) return

    setIsClaimLoading(true)
    try {
      dispatch(actions.claimFee({ index: position.positionIndex, isLocked: position.isLocked }))
    } finally {
      setIsClaimLoading(false)
      setPreviousUnclaimedFees(0)
    }
  }

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
        {type === 'header' ? (
          'Unclaimed fee'
        ) : isLoading ? (
          <div className={classes.blur} />
        ) : (
          `$${unclaimedFeesInUSD.toFixed(6)}`
        )}
      </Typography>

      <Grid container justifyContent='flex-end' alignItems='center'>
        {type === 'header' ? (
          <Typography>Action</Typography>
        ) : (
          <Button
            className={classes.claimButton}
            onClick={handleClaimFee}
            disabled={isLoading || unclaimedFeesInUSD === 0}>
            {isClaimLoading ? (
              <div className={classes.blur} />
            ) : isLoading ? (
              <div className={classes.blur} />
            ) : (
              'Claim fee'
            )}
          </Button>
        )}
      </Grid>
    </Grid>
  )
}
