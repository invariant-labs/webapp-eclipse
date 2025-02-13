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
import { TokenPool } from '@store/types/userOverview'
import { useNavigate } from 'react-router-dom'
import { STRATEGIES } from '@store/consts/userStrategies'
import icons from '@static/icons'
import { ALL_FEE_TIERS_DATA } from '@store/consts/static'
import { formatNumber2, printBN } from '@utils/utils'
import { useStyles } from './styles'
import { colors, typography } from '@static/theme'

interface YourWalletProps {
  pools: TokenPool[]
  isLoading: boolean
}

const MobileCard: React.FC<{ pool: TokenPool; classes: any; renderActions: any }> = ({
  pool,
  classes,
  renderActions
}) => {
  let strategy = STRATEGIES.find(
    s => s.tokenSymbolA === pool.symbol || s.tokenSymbolB === pool.symbol
  )

  if (!strategy) {
    const lowestFeeTierData = ALL_FEE_TIERS_DATA.reduce((lowest, current) => {
      if (!lowest) return current
      return current.tier.fee.lt(lowest.tier.fee) ? current : lowest
    })

    strategy = {
      tokenSymbolA: pool.symbol,
      tokenSymbolB: '-',
      feeTier: printBN(lowestFeeTierData.tier.fee, 10).replace('.', '_').substring(0, 4)
    }
  }

  return (
    <Box className={classes.mobileCard}>
      <Box className={classes.mobileCardHeader}>
        <Box className={classes.mobileTokenInfo}>
          <img src={pool.icon} className={classes.tokenIcon} alt={pool.symbol} />
          <Typography className={classes.tokenSymbol}>{pool.symbol}</Typography>
        </Box>
        <Box className={classes.mobileActionsContainer}>{renderActions(pool, strategy)}</Box>
      </Box>
      <Box className={classes.mobileStatsContainer}>
        <Box className={classes.mobileStatItem}>
          <Typography component='span' className={classes.mobileStatLabel}>
            Amount:
          </Typography>
          <Typography component='span' className={classes.mobileStatValue}>
            {formatNumber2(pool.amount)}
          </Typography>
        </Box>
        <Box className={classes.mobileStatItem}>
          <Typography component='span' className={classes.mobileStatLabel}>
            Value:
          </Typography>
          <Typography component='span' className={classes.mobileStatValue}>
            ${pool.value.toLocaleString().replace(',', '.')}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export const YourWallet: React.FC<YourWalletProps> = ({ pools = [], isLoading }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const totalValue = useMemo(() => pools.reduce((sum, pool) => sum + pool.value, 0), [pools])

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

  const renderActions = (pool: TokenPool, strategy: any) => (
    <>
      <Box
        className={classes.actionIcon}
        onClick={() => {
          navigate(
            `/newPosition/${strategy?.tokenSymbolA}/${strategy?.tokenSymbolB}/${strategy?.feeTier}`,
            { state: { referer: 'portfolio' } }
          )
        }}>
        <img src={icons.plusIcon} height={24} width={24} alt='Add' />
      </Box>
      <Box
        className={classes.actionIcon}
        onClick={() => {
          const targetToken = pool.symbol === 'ETH' ? 'USDC' : 'ETH'
          navigate(`/exchange/${pool.symbol}/${targetToken}`, {
            state: { referer: 'portfolio' }
          })
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
            <Skeleton variant='text' width={120} height={32} />
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
              {isLoading
                ? // Loading skeleton rows
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
                                height={24} // Match typography.heading4 height
                              />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className={classes.tableCell} align='right'>
                          {/* <Box className={classes.statsContainer}> */}
                          <Skeleton
                            variant='rectangular'
                            width='90%'
                            height={24} // Match statsValue height
                            sx={{ borderRadius: '6px', padding: '0px 6px' }}
                          />
                          {/* </Box> */}
                        </TableCell>
                        <TableCell className={classes.tableCell} align='right'>
                          {/* <Box className={classes.statsContainer}> */}
                          <Skeleton
                            variant='rectangular'
                            width='90%'
                            height={24} // Match statsValue height
                            sx={{ borderRadius: '6px', padding: '0px 6px' }}
                          />
                          {/* </Box> */}
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
                : // Actual data rows
                  pools.map(pool => {
                    let strategy = STRATEGIES.find(
                      s => s.tokenSymbolA === pool.symbol || s.tokenSymbolB === pool.symbol
                    )

                    if (!strategy) {
                      const lowestFeeTierData = ALL_FEE_TIERS_DATA.reduce((lowest, current) => {
                        if (!lowest) return current
                        return current.tier.fee.lt(lowest.tier.fee) ? current : lowest
                      })

                      strategy = {
                        tokenSymbolA: pool.symbol,
                        tokenSymbolB: '-',
                        feeTier: printBN(lowestFeeTierData.tier.fee, 10)
                          .replace('.', '_')
                          .substring(0, 4)
                      }
                    }

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
                              {formatNumber2(pool.amount)}
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
                  })}
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
        ) : (
          <Box sx={{ height: '345px', overflowY: 'auto' }}>
            {pools.map(pool => (
              <MobileCard
                key={pool.id.toString()}
                pool={pool}
                classes={classes}
                renderActions={renderActions}
              />
            ))}
          </Box>
        )}
      </Box>
    </>
  )
}
