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
import { printBN } from '@utils/utils'

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
    padding: '22px 0px',
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
    maxHeight: '251px',
    overflowY: 'auto',
    overflowX: 'hidden',

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
  },
  tableCell: {
    borderBottom: `1px solid ${colors.invariant.light}`
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
    padding: '4px 12px',
    height: '25px',
    borderRadius: '10px',
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
      background: `${colors.invariant.componentBcg}60`,
      '&:hover': {
        background: `${colors.invariant.component}B0`
      }
    }
  }
}))

interface YourWalletProps {
  pools: TokenPool[]
  isLoading: boolean
}

export const YourWallet: React.FC<YourWalletProps> = ({ pools = [], isLoading }) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const totalValue = useMemo(() => pools.reduce((sum, pool) => sum + pool.value, 0), [pools])

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = icons.unknownToken
  }

  return (
    <Box className={classes.container}>
      <Box className={classes.header}>
        <Typography className={classes.headerText}>Your Wallet</Typography>
        {isLoading ? (
          <Skeleton variant='text' width={120} height={32} />
        ) : (
          <Typography className={classes.headerText}>
            ${totalValue.toLocaleString().replace(',', '.')}
          </Typography>
        )}
      </Box>
      <TableContainer className={classes.tableContainer}>
        <Table stickyHeader sx={{ paddingRight: '5px' }}>
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
              {/* Move actions button somewhere */}
              {/* <TableCell className={classes.headerCell} align='right'>
                Action
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody className={classes.zebraRow}>
            {pools.map(pool => {
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
                <TableRow key={pool.id.toString()}>
                  <TableCell className={classes.tableCell}>
                    <Box className={classes.tokenContainer}>
                      <img
                        src={pool.icon}
                        className={classes.tokenIcon}
                        onError={handleImageError}
                        alt={pool.symbol}
                      />
                      <Typography className={classes.tokenSymbol}>{pool.symbol}</Typography>
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
                        {pool.amount.toFixed(3)}
                      </Typography>
                    </Box>
                  </TableCell>
                  {/* <TableCell className={classes.tableCell} align='right' sx={{ display: 'flex' }}>
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
                  </TableCell> */}
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}
