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
import { DEFAULT_FEE_TIER, STRATEGIES } from '@store/consts/userStrategies'
import icons from '@static/icons'
import { NetworkType, USDC_MAIN, USDC_TEST, WETH_MAIN, WETH_TEST } from '@store/consts/static'
import { addressToTicker, formatNumberWithoutSuffix } from '@utils/utils'
import { useStyles } from './styles'
import { colors, typography } from '@static/theme'
import { useDispatch, useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'
import { MobileCard } from './MobileCard'
import { TooltipHover } from '@components/TooltipHover/TooltipHover'
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import { shortenAddress } from '@utils/uiUtils'

interface YourWalletProps {
  pools: TokenPool[]
  isLoading: boolean
}

const EmptyState = ({ classes }: { classes: any }) => (
  <Box className={classes.emptyState}>
    <img src={icons.assetsEmpty} alt='Empty portfolio' height={80} width={80} />
    <Typography className={classes.emptyStateText}>No assets found</Typography>
  </Box>
)

export const YourWallet: React.FC<YourWalletProps> = ({ pools = [], isLoading }) => {
  const { classes } = useStyles({ isLoading })
  const navigate = useNavigate()
  const currentNetwork = useSelector(network)
  const dispatch = useDispatch()
  const sortedPools = useMemo(() => [...pools].sort((a, b) => b.value - a.value), [pools])

  const totalValue = useMemo(
    () => sortedPools.reduce((sum, pool) => sum + pool.value, 0),
    [sortedPools]
  )

  const findStrategy = (poolAddress: string) => {
    const poolTicker = addressToTicker(currentNetwork, poolAddress)
    let strategy = STRATEGIES.find(s => {
      const tickerA = addressToTicker(currentNetwork, s.tokenAddressA)
      const tickerB = s.tokenAddressB ? addressToTicker(currentNetwork, s.tokenAddressB) : undefined
      return tickerA === poolTicker || tickerB === poolTicker
    })

    if (!strategy) {
      // const lowestFeeTierData = ALL_FEE_TIERS_DATA.reduce((lowest, current) => {
      //   if (!lowest) return current
      //   return current.tier.fee.lt(lowest.tier.fee) ? current : lowest
      // })

      strategy = {
        tokenAddressA: poolAddress,
        feeTier: DEFAULT_FEE_TIER
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

  const networkUrl = useMemo(() => {
    switch (currentNetwork) {
      case NetworkType.Mainnet:
        return ''
      case NetworkType.Testnet:
        return '?cluster=testnet'
      case NetworkType.Devnet:
        return '?cluster=devnet'
      default:
        return ''
    }
  }, [network])

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
      <TooltipHover text='Add Position'>
        <Box
          className={classes.actionIcon}
          onClick={() => {
            console.log(strategy)
            const sourceToken = addressToTicker(currentNetwork, strategy.tokenAddressA)
            const targetToken =
              sourceToken === 'ETH'
                ? currentNetwork === NetworkType.Mainnet
                  ? USDC_MAIN.address
                  : USDC_TEST.address
                : currentNetwork === NetworkType.Mainnet
                  ? WETH_MAIN.address
                  : WETH_TEST.address

            navigate(
              `/newPosition/${sourceToken}/${addressToTicker(currentNetwork, targetToken.toString())}/${strategy.feeTier}`,
              {
                state: { referer: 'portfolio' }
              }
            )
          }}>
          <img src={icons.plusIcon} height={24} width={24} alt='Add' />
        </Box>
      </TooltipHover>
      <TooltipHover text='Exchange'>
        <Box
          className={classes.actionIcon}
          onClick={() => {
            const sourceToken = addressToTicker(currentNetwork, pool.id.toString())
            const targetToken =
              sourceToken === 'ETH'
                ? currentNetwork === NetworkType.Mainnet
                  ? USDC_MAIN.address
                  : USDC_TEST.address
                : currentNetwork === NetworkType.Mainnet
                  ? WETH_MAIN.address
                  : WETH_TEST.address
            navigate(
              `/exchange/${sourceToken}/${addressToTicker(currentNetwork, targetToken.toString())}`,
              {
                state: { referer: 'portfolio' }
              }
            )
          }}>
          <img src={icons.horizontalSwapIcon} height={24} width={24} alt='Add' />
        </Box>
      </TooltipHover>
      <TooltipHover text='Open in explorer'>
        <Box
          className={classes.actionIcon}
          onClick={() => {
            window.open(
              `https://eclipsescan.xyz/token/${pool.id.toString()}/${networkUrl}`,
              '_blank',
              'noopener,noreferrer'
            )
          }}>
          <img width={24} height={24} src={icons.newTabBtn} alt={'Exchange'} />
        </Box>
      </TooltipHover>
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
            <Typography className={classes.headerText}>
              ${formatNumberWithoutSuffix(totalValue)}
            </Typography>
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
                        <Skeleton
                          variant='rectangular'
                          width={24}
                          height={24}
                          sx={{ borderRadius: '8px', margin: '4px 0px' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
              ) : sortedPools.length === 0 ? (
                <TableRow sx={{ background: 'transparent !important' }}>
                  <TableCell colSpan={4} sx={{ border: 'none', padding: 0 }}>
                    <EmptyState classes={classes} />
                  </TableCell>
                </TableRow>
              ) : (
                sortedPools.map(pool => {
                  const poolAddress = pool.id.toString()
                  const strategy = findStrategy(poolAddress)

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
                            <Typography className={classes.tokenSymbol}>
                              {pool.symbol.length <= 6
                                ? pool.symbol
                                : shortenAddress(pool.symbol, 2)}
                            </Typography>
                            <TooltipHover text='Copy token address'>
                              <FileCopyOutlinedIcon
                                onClick={() => {
                                  navigator.clipboard.writeText(poolAddress)

                                  dispatch(
                                    snackbarsActions.add({
                                      message: 'Token address copied.',
                                      variant: 'success',
                                      persist: false
                                    })
                                  )
                                }}
                                classes={{ root: classes.clipboardIcon }}
                              />
                            </TooltipHover>
                          </Box>
                          <Box className={classes.mobileActions}>
                            {renderActions(pool, strategy)}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell className={classes.tableCell} align='right'>
                        <Box className={classes.statsContainer}>
                          <Typography className={classes.statsValue}>
                            $
                            {formatNumberWithoutSuffix(pool.value.toFixed(2), {
                              twoDecimals: true
                            })}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell className={classes.tableCell} align='right'>
                        <Box className={classes.statsContainer}>
                          <Typography className={classes.statsValue}>
                            {formatNumberWithoutSuffix(pool.amount)}
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
        <Typography
          style={{
            ...typography.heading4,
            color: colors.invariant.text
          }}>
          Your Wallet
        </Typography>
        {isLoading ? (
          renderMobileLoading()
        ) : sortedPools.length === 0 ? (
          <EmptyState classes={classes} />
        ) : (
          <Box className={classes.mobileCardContainer}>
            {sortedPools.map(pool => (
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
