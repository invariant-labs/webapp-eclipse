import React, { useMemo } from 'react'
import {
  Box,
  Typography,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { StrategyConfig, TokenPool } from '@store/types/userOverview'
import { useNavigate } from 'react-router-dom'
import { STRATEGIES } from '@store/consts/userStrategies'
import icons from '@static/icons'
import { ALL_FEE_TIERS_DATA, USDC_MAIN, WETH_MAIN } from '@store/consts/static'
import { addressToTicker, formatNumber2, printBN } from '@utils/utils'
import { useStyles } from './styles'
import { colors, typography } from '@static/theme'
import { useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'
import { MobileCard } from './MobileCard'

interface YourWalletProps {
  pools: TokenPool[]
  isLoading: boolean
}

const EmptyState = ({ classes }: { classes: any }) => (
  <Box className={classes.emptyState}>
    <img src={icons.empty} alt='Empty wallet' height={64} width={64} />
    <Typography className={classes.emptyStateText}>Your wallet is empty.</Typography>
  </Box>
)

export const YourWallet: React.FC<YourWalletProps> = ({ pools = [], isLoading }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()
  const currentNetwork = useSelector(network)
  const totalValue = useMemo(() => pools.reduce((sum, pool) => sum + pool.value, 0), [pools])

  const findStrategy = (poolAddress: string) => {
    const poolTicker = addressToTicker(currentNetwork, poolAddress)
    let strategy = STRATEGIES.find(s => {
      const tickerA = addressToTicker(currentNetwork, s.tokenAddressA)
      const tickerB = s.tokenAddressB ? addressToTicker(currentNetwork, s.tokenAddressB) : undefined
      return tickerA === poolTicker || tickerB === poolTicker
    })

    if (!strategy) {
      const lowestFeeTierData = ALL_FEE_TIERS_DATA.reduce((lowest, current) => {
        if (!lowest) return current
        return current.tier.fee.lt(lowest.tier.fee) ? current : lowest
      })

      strategy = {
        tokenAddressA: poolAddress,
        feeTier: printBN(lowestFeeTierData.tier.fee, 10).replace('.', '_').substring(0, 4)
      }
    }

    return {
      ...strategy,
      tokenSymbolA: addressToTicker(currentNetwork, strategy.tokenAddressA),
      tokenSymbolB: strategy.tokenAddressB
        ? addressToTicker(currentNetwork, strategy.tokenAddressB)
        : '-'
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }

  const renderMobileLoading = () => (
    <Box className={classes.mobileContainer}>
      {Array(3)
        .fill(0)
        .map((_, index) => (
          <Box key={`skeleton-${index}`} className={classes.mobileCard}>
            <Box className={classes.mobileCardHeader}>
              <Box className={classes.mobileTokenInfo}>
                <Skeleton variant='circular' width={28} height={28} />
                <Skeleton variant='text' width={60} />
              </Box>
              <Box className={classes.mobileActionsContainer}>
                <Skeleton variant='circular' width={32} height={32} />
                <Skeleton variant='circular' width={32} height={32} />
              </Box>
            </Box>
            <Box className={classes.mobileStatsContainer}>
              <Skeleton variant='rectangular' height={41} />
              <Skeleton variant='rectangular' height={41} />
            </Box>
          </Box>
        ))}
    </Box>
  )

  const renderActions = (pool: TokenPool, strategy: StrategyConfig) => (
    <>
      <Box
        className={classes.actionIcon}
        onClick={() => {
          console.log(strategy)
          const sourceToken = addressToTicker(currentNetwork, strategy.tokenAddressA)
          const targetToken = strategy.tokenAddressB
            ? addressToTicker(currentNetwork, strategy.tokenAddressB)
            : '-'

          navigate(`/newPosition/${sourceToken}/${targetToken}/${strategy.feeTier}`, {
            state: { referer: 'portfolio' }
          })
        }}>
        <img src={icons.plusIcon} height={24} width={24} alt='Add' />
      </Box>
      <Box
        className={classes.actionIcon}
        onClick={() => {
          const sourceToken = addressToTicker(currentNetwork, pool.id.toString())
          const targetToken = sourceToken === 'ETH' ? USDC_MAIN.address : WETH_MAIN.address
          navigate(
            `/exchange/${sourceToken}/${addressToTicker(currentNetwork, targetToken.toString())}`,
            {
              state: { referer: 'portfolio' }
            }
          )
        }}>
        <img src={icons.horizontalSwapIcon} height={24} width={24} alt='Add' />
      </Box>
    </>
  )
  return (
    <>
      <Box className={classes.desktopContainer}>
        <Box className={classes.header}>
          <Typography className={classes.headerText}>Available Balance</Typography>
          {isLoading ? (
            <Skeleton variant='text' width={100} height={32} sx={{ marginRight: '16px' }} />
          ) : (
            <Typography className={classes.headerText}>${formatNumber2(totalValue)}</Typography>
          )}
        </Box>

        <TableContainer className={classes.tableContainer}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className={classes.headerCell} sx={{ width: '25%' }} align='left'>
                  Token Name
                </TableCell>
                <TableCell className={classes.headerCell} sx={{ width: '30%' }} align='left'>
                  Value
                </TableCell>
                <TableCell className={classes.headerCell} sx={{ width: '30%' }} align='left'>
                  Amount
                </TableCell>
                <TableCell
                  className={`${classes.headerCell} ${classes.desktopActionCell}`}
                  align='right'>
                  Action
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody className={classes.zebraRow}>
              {isLoading ? (
                // Loading skeleton rows
                Array(4)
                  .fill(0)
                  .map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell className={classes.tableCell}>
                        <Box className={classes.tokenContainer}>
                          <Box className={classes.tokenInfo}>
                            <Skeleton variant='circular' width={28} height={28} />
                            <Skeleton
                              variant='rectangular'
                              width={60}
                              sx={{ borderRadius: '6px' }}
                              height={24}
                            />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell className={classes.tableCell} align='right'>
                        <Skeleton
                          variant='rectangular'
                          width='90%'
                          height={24}
                          sx={{ borderRadius: '6px', padding: '0px 6px' }}
                        />
                      </TableCell>
                      <TableCell className={classes.tableCell} align='right'>
                        <Skeleton
                          variant='rectangular'
                          width='90%'
                          height={24}
                          sx={{ borderRadius: '6px', padding: '0px 6px' }}
                        />
                      </TableCell>
                      <TableCell
                        className={`${classes.tableCell} ${classes.desktopActionCell}`}
                        align='right'
                        sx={{
                          display: 'flex',
                          gap: 1,
                          justifyContent: 'center'
                        }}>
                        <Skeleton
                          variant='rectangular'
                          width={24}
                          height={24}
                          sx={{ borderRadius: '8px', margin: '4px 0px' }}
                        />
                        <Skeleton
                          variant='rectangular'
                          width={24}
                          height={24}
                          sx={{ borderRadius: '8px', margin: '4px 0px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : pools.length === 0 ? (
                <TableRow sx={{ background: 'transparent !important ' }}>
                  <TableCell colSpan={4} sx={{ border: 'none' }}>
                    <EmptyState classes={classes} />
                  </TableCell>
                </TableRow>
              ) : (
                pools.map(pool => {
                  const strategy = findStrategy(pool.id.toString())

                  return (
                    <TableRow key={pool.id.toString()}>
                      <TableCell className={classes.tableCell}>
                        <Box className={classes.tokenContainer}>
                          <Box className={classes.tokenInfo}>
                            <img
                              src={pool.icon}
                              className={classes.tokenIcon}
                              onError={handleImageError}
                              alt={pool.symbol}
                            />
                            <Typography className={classes.tokenSymbol}>{pool.symbol}</Typography>
                          </Box>
                          <Box className={classes.mobileActions}>
                            {renderActions(pool, strategy)}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell className={classes.tableCell} align='right'>
                        <Box className={classes.statsContainer}>
                          <Typography className={classes.statsValue}>
                            ${pool.value.toLocaleString().replace(',', '.')}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell className={classes.tableCell} align='right'>
                        <Box className={classes.statsContainer}>
                          <Typography className={classes.statsValue}>
                            {formatNumber2(pool.amount, { twoDecimals: true })}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell
                        className={`${classes.tableCell} ${classes.desktopActionCell}`}
                        align='right'
                        sx={{ display: 'flex' }}>
                        {renderActions(pool, strategy)}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box className={classes.mobileContainer}>
        <Typography style={{ ...typography.heading4, color: colors.invariant.text }}>
          Your Wallet
        </Typography>
        {isLoading ? (
          renderMobileLoading()
        ) : pools.length === 0 ? (
          <EmptyState classes={classes} />
        ) : (
          <Box sx={{ height: '345px', overflowY: 'auto' }}>
            {pools.map(pool => (
              <MobileCard
                key={pool.id.toString()}
                pool={pool}
                classes={classes}
                getStrategy={() => findStrategy(pool.id.toString())}
                renderActions={renderActions}
              />
            ))}
          </Box>
        )}
      </Box>
    </>
  )
}
