import React, { useEffect, useMemo, useState } from 'react'
import { Button, Grid, Typography } from '@mui/material'
import icons from '@static/icons'
import classNames from 'classnames'
import { Token } from '@components/OverviewYourPositions/types/types'
import { useStyles } from './styles'
import { Tick } from '@invariant-labs/sdk-eclipse/lib/market'
import { useSelector } from 'react-redux'
import { singlePositionData } from '@store/selectors/positions'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { printBN } from '@utils/utils'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getEclipseWallet } from '@utils/web3/wallet'

interface PositionTicks {
  lowerTick: Tick | undefined
  upperTick: Tick | undefined
  loading: boolean
}

interface UnclaimedFeeItemProps {
  type: 'header' | 'item'
  data?: {
    id: string
    index: number
    tokenX: Token
    tokenY: Token
    fee: number
    value: number
    unclaimedFee: number
  }
  hideBottomLine?: boolean
  onClaim?: () => void
}

export const UnclaimedFeeItem: React.FC<UnclaimedFeeItemProps> = ({
  type,
  data,
  hideBottomLine,
  onClaim
}) => {
  const { classes } = useStyles()
  const [positionTicks, setPositionTicks] = useState<PositionTicks>({
    lowerTick: undefined,
    upperTick: undefined,
    loading: false
  })
  const [showFeesLoader, setShowFeesLoader] = useState(true)

  const position = useSelector(singlePositionData(data?.id ?? ''))

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }
  const wallet = getEclipseWallet()

  const networkType = useSelector(network)
  const rpc = useSelector(rpcAddress)

  useEffect(() => {
    const fetchTicksForPosition = async () => {
      if (!data?.id || !position?.poolData) return

      try {
        setPositionTicks(prev => ({ ...prev, loading: true }))

        const marketProgram = await getMarketProgram(networkType, rpc, wallet as IWallet)
        const pair = new Pair(position.poolData.tokenX, position.poolData.tokenY, {
          fee: position.poolData.fee,
          tickSpacing: position.poolData.tickSpacing
        })

        const [lowerTick, upperTick] = await Promise.all([
          marketProgram.getTick(pair, position.lowerTickIndex),
          marketProgram.getTick(pair, position.upperTickIndex)
        ])

        console.log({ lowerTick: lowerTick.index, upperTick: upperTick.index, position })

        setPositionTicks({
          lowerTick,
          upperTick,
          loading: false
        })
      } catch (error) {
        console.error('Error fetching ticks:', error)
        setPositionTicks({
          lowerTick: undefined,
          upperTick: undefined,
          loading: false
        })
      }
    }

    fetchTicksForPosition()
  }, [data?.id, position])

  const [tokenXClaim, tokenYClaim] = useMemo(() => {
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

      setShowFeesLoader(false)

      return [+printBN(bnX, position.tokenX.decimals), +printBN(bnY, position.tokenY.decimals)]
    }

    return [0, 0]
  }, [position, positionTicks])
  console.log({ tokenXClaim, tokenYClaim })
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
        {type === 'header' ? 'Value' : `$${data?.value.toFixed(2)}`}
      </Typography>

      <Typography style={{ alignSelf: 'center' }}>
        {type === 'header'
          ? 'Unclaimed fee'
          : showFeesLoader
            ? 'Loading...'
            : `$${(tokenXClaim + tokenYClaim).toFixed(6)}`}
      </Typography>

      <Grid container justifyContent='flex-end' alignItems='center'>
        {type === 'header' ? (
          <Typography>Action</Typography>
        ) : (
          <Button
            className={classes.claimButton}
            onClick={onClaim}
            disabled={showFeesLoader || tokenXClaim + tokenYClaim === 0}>
            {showFeesLoader ? 'Loading...' : 'Claim fee'}
          </Button>
        )}
      </Grid>
    </Grid>
  )
}
