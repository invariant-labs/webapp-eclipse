import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Theme
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'
import { NetworkType } from '@store/consts/static'
import { useSelector } from 'react-redux'
import { network as currentNetwork } from '@store/selectors/solanaConnection'
import { PositionTableRow } from './PositionsTableRow'
import { IPositionItem } from '../../../types'
import { useNavigate } from 'react-router-dom'

const useStyles = makeStyles()((_theme: Theme) => ({
  tableContainer: {
    width: 'fit-content',
    background: 'transparent',
    boxShadow: 'none',
    display: 'flex',
    flexDirection: 'column'
  },
  table: {
    borderCollapse: 'separate',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  cellBase: {
    padding: '14px 20px',
    background: 'inherit',
    border: 'none',
    whiteSpace: 'nowrap',
    textAlign: 'center'
  },
  headerRow: {
    height: '50px',
    background: colors.invariant.component,
    '& th:first-of-type': {
      borderTopLeftRadius: '24px'
    },
    '& th:last-child': {
      borderTopRightRadius: '24px'
    }
  },
  headerCell: {
    fontSize: '16px',
    lineHeight: '24px',
    border: 'none',
    color: colors.invariant.textGrey,
    fontWeight: 400,
    textAlign: 'center'
  },
  // Footer styles
  footerRow: {
    background: colors.invariant.component,
    height: '50px',
    '& td:first-of-type': {
      borderBottomLeftRadius: '24px'
    },
    '& td:last-child': {
      borderBottomRightRadius: '24px'
    }
  },
  pairNameCell: {
    width: '25%',
    textAlign: 'left',
    padding: '14px 20px 14px 22px !important'
  },
  pointsCell: {
    width: '8%',
    '& > div': {
      justifyContent: 'center'
    }
  },
  feeTierCell: {
    width: '12%',
    '& > div': {
      justifyContent: 'center'
    }
  },
  tokenRatioCell: {
    width: '15%',
    '& > div': {
      margin: '0 auto'
    }
  },
  valueCell: {
    width: '10%',
    '& .MuiGrid-root': {
      justifyContent: 'center'
    }
  },
  feeCell: {
    width: '10%',
    '& .MuiGrid-root': {
      justifyContent: 'center'
    }
  },
  chartCell: {
    width: '16%',
    '& > div': {
      margin: '0 auto'
    }
  },
  actionCell: {
    width: '4%',
    padding: '14px 8px',
    '& > button': {
      margin: '0 auto'
    }
  },
  // Table layout styles
  tableHead: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  tableBody: {
    display: 'block',
    maxHeight: 'calc(4 * (20px + 85px))',
    overflowY: 'auto',
    '&::-webkit-scrollbar': {
      width: '4px'
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent'
    },
    '&::-webkit-scrollbar-thumb': {
      background: colors.invariant.pink,
      borderRadius: '4px'
    },
    '& > tr:nth-of-type(odd)': {
      background: colors.invariant.component,
      '&:hover': {
        background: `${colors.invariant.component}B0`,
        cursor: 'pointer'
      }
    },
    '& > tr:nth-of-type(even)': {
      background: `${colors.invariant.component}80`,
      '&:hover': {
        background: `${colors.invariant.component}90`,
        cursor: 'pointer'
      }
    },
    '& > tr': {
      '& td': {
        borderBottom: `1px solid ${colors.invariant.light}`
      }
    },
    '& > tr:first-of-type td': {
      borderTop: `1px solid ${colors.invariant.light}`
    }
  },
  tableBodyRow: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  tableFooter: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  }
}))

interface IPositionsTableProps {
  positions: Array<IPositionItem>
  isLockPositionModalOpen: boolean
  setIsLockPositionModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const PositionsTable: React.FC<IPositionsTableProps> = ({
  positions,
  isLockPositionModalOpen,
  setIsLockPositionModalOpen
}) => {
  const { classes } = useStyles()
  const networkSelector = useSelector(currentNetwork)
  const navigate = useNavigate()

  return (
    <TableContainer className={classes.tableContainer}>
      <Table className={classes.table}>
        <TableHead className={classes.tableHead}>
          <TableRow className={classes.headerRow}>
            <TableCell className={`${classes.headerCell} ${classes.pairNameCell}`}>
              Pair name
            </TableCell>

            <TableCell className={`${classes.headerCell} ${classes.feeTierCell}`}>
              Fee tier
            </TableCell>
            <TableCell className={`${classes.headerCell} ${classes.tokenRatioCell}`}>
              Token ratio
            </TableCell>
            <TableCell className={`${classes.headerCell} ${classes.valueCell}`}>Value</TableCell>
            <TableCell className={`${classes.headerCell} ${classes.feeCell}`}>Fee</TableCell>
            <TableCell className={`${classes.headerCell} ${classes.chartCell}`}>Chart</TableCell>
            <TableCell className={`${classes.headerCell} ${classes.actionCell}`}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className={classes.tableBody}>
          {positions.map((position, index) => (
            <TableRow
              onClick={e => {
                if (
                  !(e.target as HTMLElement).closest('.action-button') &&
                  !isLockPositionModalOpen
                ) {
                  navigate(`/position/${position.id}`)
                }
              }}
              key={position.poolAddress.toString() + index}
              className={classes.tableBodyRow}>
              <PositionTableRow
                {...position}
                isLockPositionModalOpen={isLockPositionModalOpen}
                setIsLockPositionModalOpen={setIsLockPositionModalOpen}
              />
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className={classes.tableFooter}>
          <TableRow className={classes.footerRow}>
            <TableCell className={`${classes.cellBase} ${classes.pairNameCell}`} />
            {networkSelector === NetworkType.Mainnet && (
              <TableCell className={`${classes.cellBase} ${classes.pointsCell}`} />
            )}
            <TableCell className={`${classes.cellBase} ${classes.feeTierCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.tokenRatioCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.valueCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.feeCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.chartCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.actionCell}`} />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default PositionsTable
