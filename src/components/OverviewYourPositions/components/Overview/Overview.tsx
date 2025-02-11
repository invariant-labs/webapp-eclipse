import React, { useEffect, useMemo, useState } from 'react'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { useStyles } from './styles'
import { ProcessedPool } from '@store/types/userOverview'
import { useSelector } from 'react-redux'
import { colors, theme, typography } from '@static/theme'
import ResponsivePieChart from '../OverviewPieChart/ResponsivePieChart'
import { positionsWithPoolsData } from '@store/selectors/positions'
import { formatNumber2, getTokenPrice, printBN } from '@utils/utils'
import { calculateClaimAmount } from '@invariant-labs/sdk-eclipse/lib/utils'
import { getMarketProgram } from '@utils/web3/programs/amm'
import { network, rpcAddress } from '@store/selectors/solanaConnection'
import { getEclipseWallet } from '@utils/web3/wallet'
import { IWallet, Pair } from '@invariant-labs/sdk-eclipse'
import MobileOverview from './MobileOverview'
import { useDominantLogoColor } from '@store/hooks/userOverview/useDominantLogoColor'
import { useAgregatedPositions } from '@store/hooks/userOverview/useAgregatedPositions'
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
  const [totalUnclaimedFee, setTotalUnclaimedFee] = useState(0)
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [logoColors, setLogoColors] = useState<Record<string, string>>({})

  const { getDominantColor, getTokenColor, tokenColorOverrides } = useDominantLogoColor()

  const { positions } = useAgregatedPositions(positionList, prices)

  const data = useMemo(() => {
    const tokens: { label: string; value: number }[] = []

    positions.map(position => {
      let foundToken = false

      tokens.map(token => {
        if (token.label === position.token) {
          foundToken = true
          token.value += position.value
        }
      })

      if (!foundToken) {
        tokens.push({
          label: position.token,
          value: position.value
        })
      }
    })

    return tokens
  }, [positions])

  const chartColors = useMemo(
    () =>
      positions.map(position =>
        getTokenColor(position.token, logoColors[position.logo ?? 0], tokenColorOverrides)
      ),
    [positions, logoColors]
  )

  const totalAssets = useMemo(() => {
    return positions.reduce((acc, position) => acc + position.value, 0)
  }, [positions])

  useEffect(() => {
    const calculateUnclaimedFee = async () => {
      const wallet = getEclipseWallet()
      const marketProgram = await getMarketProgram(networkType, rpc, wallet as IWallet)
      let totalUnclaimedFee = 0

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

      for (let i = 0; i < positionList.length; i++) {
        const [lowerTick, upperTick] = ticks[i]
        const [bnX, bnY] = calculateClaimAmount({
          position: positionList[i],
          tickLower: lowerTick,
          tickUpper: upperTick,
          tickCurrent: positionList[i].poolData.currentTickIndex,
          feeGrowthGlobalX: positionList[i].poolData.feeGrowthGlobalX,
          feeGrowthGlobalY: positionList[i].poolData.feeGrowthGlobalY
        })

        totalUnclaimedFee +=
          +printBN(bnX, positionList[i].tokenX.decimals) *
            prices[positionList[i].tokenX.assetAddress.toString()] +
          +printBN(bnY, positionList[i].tokenY.decimals) *
            prices[positionList[i].tokenY.assetAddress.toString()]
      }

      setTotalUnclaimedFee(isFinite(totalUnclaimedFee) ? totalUnclaimedFee : 0)
    }

    calculateUnclaimedFee()
  }, [positionList, prices])

  useEffect(() => {
    const loadPrices = async () => {
      const tokens: string[] = []

      positionList.map(position => {
        if (!tokens.includes(position.tokenX.assetAddress.toString())) {
          tokens.push(position.tokenX.assetAddress.toString())
        }

        if (!tokens.includes(position.tokenY.assetAddress.toString())) {
          tokens.push(position.tokenY.assetAddress.toString())
        }
      })

      const prices = await Promise.all(tokens.map(async token => await getTokenPrice(token)))

      const record = {}
      for (let i = 0; i < tokens.length; i++) {
        record[tokens[i]] = prices[i] ?? 0
      }

      setPrices(record)
    }

    loadPrices()
  }, [positionList])

  useEffect(() => {
    positions.forEach(position => {
      if (position.logo && !logoColors[position.logo]) {
        getDominantColor(position.logo)
          .then(color => {
            setLogoColors(prev => ({
              ...prev,
              [position.logo ?? 0]: color
            }))
          })
          .catch(error => {
            console.error('Error getting color for logo:', error)
          })
      }
    })
  }, [positions, getDominantColor, logoColors])

  return (
    <Box className={classes.container}>
      <HeaderSection totalValue={totalAssets} />
      <UnclaimedSection unclaimedTotal={totalUnclaimedFee} />
      {isLg ? (
        <MobileOverview positions={positions} totalAssets={totalAssets} chartColors={chartColors} />
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
          {positions.length > 0 ? (
            <Box sx={{ marginTop: 2 }}>
              <Typography sx={{ ...typography.body2, color: colors.invariant.textGrey }}>
                Tokens
              </Typography>

              <Grid
                container
                spacing={1}
                sx={{
                  marginTop: 1,
                  minHeight: '120px',
                  overflowY: 'auto',
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
                    logoColors[position.logo ?? 0],
                    tokenColorOverrides
                  )
                  return (
                    <Grid
                      item
                      container
                      key={position.token}
                      sx={{
                        paddingLeft: '0 !important',

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
          ) : null}

          <Box
            sx={{
              flex: '1 1 100%',
              minHeight: 'fit-content',
              [theme.breakpoints.down('lg')]: {
                marginTop: '100px'
              }
            }}>
            <ResponsivePieChart data={data} chartColors={chartColors} />
          </Box>
        </Box>
      )}
    </Box>
  )
}
