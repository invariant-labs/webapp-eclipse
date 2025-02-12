import React, { useEffect, useMemo, useState } from 'react'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { useStyles } from './styles'
import { ProcessedPool } from '@store/types/userOverview'
import { useSelector } from 'react-redux'
import { colors, theme, typography } from '@static/theme'
import ResponsivePieChart from '../OverviewPieChart/ResponsivePieChart'
import { isLoadingPositionsList, positionsWithPoolsData } from '@store/selectors/positions'
import { formatNumber2, getTokenPrice, printBN } from '@utils/utils'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getEclipseWallet } from '@utils/web3/wallet'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import MobileOverview from './MobileOverview'
import { useDominantLogoColor } from '@store/hooks/userOverview/useDominantLogoColor'
import { useAgregatedPositions } from '@store/hooks/userOverview/useAgregatedPositions'
import LegendSkeleton from './skeletons/LegendSkeleton'

interface OverviewProps {
  poolAssets: ProcessedPool[]
  isLoading?: boolean
}

export const Overview: React.FC<OverviewProps> = () => {
  const { classes } = useStyles()
  const rpc = useSelector(rpcAddress)
  const networkType = useSelector(network)
  const positionList = useSelector(positionsWithPoolsData)
  const isLg = useMediaQuery(theme.breakpoints.down('lg'))
  const isLoadingList = useSelector(isLoadingPositionsList)

  // State management
  const [totalUnclaimedFee, setTotalUnclaimedFee] = useState(0)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [logoColors, setLogoColors] = useState<Record<string, string>>({})
  const [pendingColorLoads, setPendingColorLoads] = useState<Set<string>>(new Set())

  const { getDominantColor, getTokenColor, tokenColorOverrides } = useDominantLogoColor()
  const { positions } = useAgregatedPositions(positionList, prices)

  // Compute loading states
  const isColorsLoading = useMemo(() => pendingColorLoads.size > 0, [pendingColorLoads])

  const chartColors = useMemo(
    () =>
      positions.map(position =>
        getTokenColor(position.token, logoColors[position.logo ?? ''] ?? '', tokenColorOverrides)
      ),
    [positions, logoColors, getTokenColor, tokenColorOverrides]
  )

  const totalAssets = useMemo(
    () => positions.reduce((acc, position) => acc + position.value, 0),
    [positions]
  )

  const isDataReady = !isLoadingList && !isColorsLoading && Object.keys(prices).length > 0

  const data = useMemo(() => {
    if (!isDataReady) return []

    const tokens: { label: string; value: number }[] = []
    positions.forEach(position => {
      const existingToken = tokens.find(token => token.label === position.token)
      if (existingToken) {
        existingToken.value += position.value
      } else {
        tokens.push({
          label: position.token,
          value: position.value
        })
      }
    })
    return tokens
  }, [positions, isDataReady])

  useEffect(() => {
    const loadPrices = async () => {
      const uniqueTokens = new Set<string>()
      positionList.forEach(position => {
        uniqueTokens.add(position.tokenX.assetAddress.toString())
        uniqueTokens.add(position.tokenY.assetAddress.toString())
      })

      const tokenArray = Array.from(uniqueTokens)
      const priceResults = await Promise.all(
        tokenArray.map(async token => ({
          token,
          price: await getTokenPrice(token)
        }))
      )

      const newPrices = priceResults.reduce(
        (acc, { token, price }) => ({
          ...acc,
          [token]: price ?? 0
        }),
        {}
      )

      setPrices(newPrices)
    }

    loadPrices()
  }, [positionList])

  // Load logo colors
  useEffect(() => {
    positions.forEach(position => {
      if (position.logo && !logoColors[position.logo] && !pendingColorLoads.has(position.logo)) {
        setPendingColorLoads(prev => new Set(prev).add(position.logo ?? ''))

        getDominantColor(position.logo)
          .then(color => {
            setLogoColors(prev => ({
              ...prev,
              [position.logo ?? '']: color
            }))
            setPendingColorLoads(prev => {
              const next = new Set(prev)
              next.delete(position.logo ?? '')
              return next
            })
          })
          .catch(error => {
            console.error('Error getting color for logo:', error)
            setPendingColorLoads(prev => {
              const next = new Set(prev)
              next.delete(position.logo ?? '')
              return next
            })
          })
      }
    })
  }, [positions, getDominantColor, logoColors, pendingColorLoads])

  useEffect(() => {
    const calculateUnclaimedFee = async () => {
      try {
        const wallet = getEclipseWallet()
        const marketProgram = await getMarketProgram(networkType, rpc, wallet as IWallet)

        const ticks = await Promise.all(
          positionList.map(async position => {
            const pair = new Pair(position.poolData.tokenX, position.poolData.tokenY, {
              fee: position.poolData.fee,
              tickSpacing: position.poolData.tickSpacing
            })

            return Promise.all([
              marketProgram.getTick(pair, position.lowerTickIndex),
              marketProgram.getTick(pair, position.upperTickIndex)
            ])
          })
        )

        const total = positionList.reduce((acc, position, i) => {
          const [lowerTick, upperTick] = ticks[i]
          const [bnX, bnY] = calculateClaimAmount({
            position,
            tickLower: lowerTick,
            tickUpper: upperTick,
            tickCurrent: position.poolData.currentTickIndex,
            feeGrowthGlobalX: position.poolData.feeGrowthGlobalX,
            feeGrowthGlobalY: position.poolData.feeGrowthGlobalY
          })

          const xValue =
            +printBN(bnX, position.tokenX.decimals) *
            (prices[position.tokenX.assetAddress.toString()] ?? 0)
          const yValue =
            +printBN(bnY, position.tokenY.decimals) *
            (prices[position.tokenY.assetAddress.toString()] ?? 0)

          return acc + xValue + yValue
        }, 0)

        setTotalUnclaimedFee(isFinite(total) ? total : 0)
      } catch (error) {
        console.error('Error calculating unclaimed fees:', error)
        setTotalUnclaimedFee(0)
      }
    }

    if (Object.keys(prices).length > 0) {
      calculateUnclaimedFee()
    }
  }, [positionList, prices, networkType, rpc])

  return (
    <Box className={classes.container}>
      <HeaderSection totalValue={totalAssets} loading={isLoadingList} />
      <UnclaimedSection unclaimedTotal={totalUnclaimedFee} loading={isLoadingList} />

      {isLg ? (
        <MobileOverview
          positions={positions}
          totalAssets={totalAssets}
          chartColors={chartColors}
          // loading={!isDataReady}
        />
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            flexDirection: 'row-reverse',
            [theme.breakpoints.down('lg')]: {
              justifyContent: 'center',
              flexDirection: 'column'
            }
          }}>
          <Box sx={{ marginTop: 2, width: '450px' }}>
            {!isDataReady ? (
              <LegendSkeleton />
            ) : (
              <Box sx={{ marginTop: 2 }}>
                <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>
                  Tokens
                </Typography>

                <Grid
                  container
                  spacing={1}
                  sx={{
                    height: '130px',
                    overflowY: positions.length <= 3 ? 'hidden' : 'auto',
                    marginTop: '8px',
                    marginLeft: '0 !important',
                    '&::-webkit-scrollbar': {
                      width: '4px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: colors.invariant.pink,
                      borderRadius: '4px'
                    }
                  }}>
                  {positions.map(position => {
                    const textColor = getTokenColor(
                      position.token,
                      logoColors[position.logo ?? ''] ?? '',
                      tokenColorOverrides
                    )
                    return (
                      <Grid
                        item
                        container
                        key={position.token}
                        sx={{
                          paddingLeft: '0 !important',
                          paddingTop: '16px !important',
                          display: 'flex',
                          [theme.breakpoints.down('lg')]: {
                            justifyContent: 'space-between'
                          },
                          justifyContent: 'flex-start'
                        }}>
                        <Grid
                          item
                          xs={2}
                          alignContent={'center'}
                          sx={{
                            display: 'flex',
                            alignItems: 'center'
                          }}>
                          <img
                            src={position.logo}
                            alt={'Token logo'}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '100%'
                            }}
                          />
                        </Grid>

                        <Grid item xs={3} alignContent={'center'}>
                          <Typography
                            style={{
                              ...typography.heading4,
                              color: textColor
                            }}>
                            {position.token}:
                          </Typography>
                        </Grid>

                        <Grid item xs={5} alignContent={'center'}>
                          <Typography
                            style={{
                              ...typography.heading4,
                              color: colors.invariant.text,
                              textAlign: 'right',
                              paddingLeft: '8px'
                            }}>
                            ${formatNumber2(position.value)}
                          </Typography>
                        </Grid>
                      </Grid>
                    )
                  })}
                </Grid>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flex: '1 1 100%',
              minHeight: 'fit-content',
              [theme.breakpoints.down('lg')]: {
                marginTop: '100px'
              }
            }}>
            <ResponsivePieChart data={data} chartColors={chartColors} isLoading={!isDataReady} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
