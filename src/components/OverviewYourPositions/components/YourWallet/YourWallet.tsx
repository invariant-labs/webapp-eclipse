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
import { makeStyles } from 'tss-react/mui'
import { colors, theme, typography } from '@static/theme'
import { TokenPool } from '@store/types/userOverview'
import { useNavigate } from 'react-router-dom'
import { STRATEGIES } from '@store/consts/userStrategies'
import icons from '@static/icons'
import { ALL_FEE_TIERS_DATA } from '@store/consts/static'
import { formatNumber2, printBN } from '@utils/utils'

const useStyles = makeStyles()(() => ({
  container: {
    minWidth: '50%',
    overflowX: 'hidden'
  },
  divider: {
    width: '100%',
    height: '1px',
    backgroundColor: colors.invariant.light,
    margin: '24px 0'
  },
  header: {
    background: colors.invariant.component,
    width: '100%',
    display: 'flex',
    padding: '16px 0px',
    [theme.breakpoints.down('lg')]: {
      borderTopLeftRadius: '24px'
    },
    borderTopLeftRadius: 0,
    borderTopRightRadius: '24px',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: `1px solid ${colors.invariant.light}`
  },
  headerText: {
    ...typography.heading2,
    paddingInline: '16px',
    color: colors.invariant.text
  },
  tableContainer: {
    borderBottomRightRadius: '24px',
    [theme.breakpoints.down('lg')]: {
      borderBottomLeftRadius: '24px'
    },
    borderBottomLeftRadius: 0,
    backgroundColor: colors.invariant.component,
    height: '279px',
    overflowY: 'auto',
    overflowX: 'hidden',

    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '4px'
    }
  },
  tableCell: {
    borderBottom: `1px solid ${colors.invariant.light}`,
    padding: '12px !important'
  },
  headerCell: {
    fontSize: '20px',
    fontWeight: 400,
    color: colors.invariant.textGrey,
    borderBottom: `1px solid ${colors.invariant.light}`,
    backgroundColor: colors.invariant.component,
    position: 'sticky',
    top: 0,
    zIndex: 1
  },
  tokenContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.down('md')]: {
      gap: '16px',
      width: '100%',
      flexDirection: 'column',
      justifyContent: 'center'
    }
  },
  tokenInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  tokenIcon: {
    minWidth: 28,
    maxWidth: 28,
    height: 28,
    borderRadius: '50%',
    objectFit: 'cover'
  },
  tokenSymbol: {
    ...typography.heading4,
    color: colors.invariant.text
  },
  statsContainer: {
    backgroundColor: colors.invariant.light,
    display: 'inline-flex',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    [theme.breakpoints.down('lg')]: {
      padding: '4px 6px'
    },
    padding: '4px 12px',
    maxhHeight: '24px',
    borderRadius: '6px',
    gap: '16px'
  },
  statsLabel: {
    ...typography.caption1,
    color: colors.invariant.textGrey
  },
  statsValue: {
    ...typography.caption1,
    color: colors.invariant.green
  },
  actionIcon: {
    height: 32,
    background: 'none',
    width: 32,
    padding: 0,
    margin: 0,
    border: 'none',
    color: colors.invariant.black,
    textTransform: 'none',
    transition: 'filter 0.2s linear',
    '&:hover': {
      filter: 'brightness(1.2)',
      cursor: 'pointer',
      '@media (hover: none)': {
        filter: 'none'
      }
    }
  },
  zebraRow: {
    '& > tr:nth-of-type(odd)': {
      background: `${colors.invariant.componentDark}`
    }
  },

  mobileActionContainer: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      gap: '8px',
      padding: '12px 16px',
      borderBottom: `1px solid ${colors.invariant.light}`
    }
  },
  desktopActionCell: {
    padding: '17px',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    }
  },
  mobileActions: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      gap: '8px'
    }
  },
  mobileContainer: {
    display: 'none',
    [theme.breakpoints.down('md')]: {
      display: 'flex',
      flexDirection: 'column'
    }
  },
  mobileCard: {
    backgroundColor: colors.invariant.component,
    borderRadius: '16px',
    padding: '16px',
    marginTop: '8px'
  },
  mobileCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px'
  },
  mobileTokenInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  mobileActionsContainer: {
    display: 'flex',
    gap: '8px'
  },
  mobileStatsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '8px'
  },
  mobileStatItem: {
    backgroundColor: colors.invariant.light,
    borderRadius: '10px',
    textAlign: 'center',
    width: '100%',
    minHeight: '24px'
  },
  mobileStatLabel: {
    ...typography.caption1,
    color: colors.invariant.textGrey,
    marginRight: '8px'
  },
  mobileStatValue: {
    ...typography.caption1,
    color: colors.invariant.green
  },
  desktopContainer: {
    width: '600px',
    [theme.breakpoints.down('md')]: {
      display: 'none'
    },
    [theme.breakpoints.down('lg')]: {
      width: 'auto'
    }
  }
}))

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
                <TableCell className={classes.headerCell} align='left'>
                  Token Name
                </TableCell>
                <TableCell className={classes.headerCell} align='left'>
                  Value
                </TableCell>
                <TableCell className={classes.headerCell} align='left'>
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
                  Array(3)
                    .fill(0)
                    .map((_, index) => (
                      <TableRow key={`skeleton-${index}`}>
                        <TableCell className={classes.tableCell}>
                          <Box className={classes.tokenContainer}>
                            <Box className={classes.tokenInfo}>
                              <Skeleton variant='circular' width={28} height={28} />
                              <Skeleton variant='text' width={60} />
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell className={classes.tableCell} align='right'>
                          <Box className={classes.statsContainer}>
                            <Skeleton variant='text' width={80} />
                          </Box>
                        </TableCell>
                        <TableCell className={classes.tableCell} align='right'>
                          <Box className={classes.statsContainer}>
                            <Skeleton variant='text' width={60} />
                          </Box>
                        </TableCell>
                        <TableCell
                          className={`${classes.tableCell} ${classes.desktopActionCell}`}
                          align='right'
                          sx={{ display: 'flex' }}>
                          <Skeleton
                            variant='circular'
                            width={32}
                            height={32}
                            sx={{ marginRight: 1 }}
                          />
                          <Skeleton variant='circular' width={32} height={32} />
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
