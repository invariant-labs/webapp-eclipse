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
import { IPositionItem } from './types'

const useStyles = makeStyles()((theme: Theme) => ({
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
    color: colors.invariant.textGrey,
    fontWeight: 400,
    whiteSpace: 'nowrap',
    padding: '12px 20px',
    background: 'inherit',
    textAlign: 'center',
    border: 'none'
  },
  pairNameHeaderCell: {
    textAlign: 'left',
    paddingLeft: '72px',
    width: '25%'
  },
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
  footerCell: {
    padding: '12px 20px',
    background: 'inherit',
    border: 'none'
  },
  narrowCell: {
    width: '8%'
  },
  mediumCell: {
    width: '10%'
  },
  wideCell: {
    width: '15%'
  },
  chartCell: {
    width: '20%'
  },
  actionCell: {
    width: '4%'
  },
  tableHead: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  tableBody: {
    display: 'block',
    maxHeight: 'calc(3 * (20px + 50px))',
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
}

export const PositionsTable: React.FC<IPositionsTableProps> = ({ positions }) => {
  const { classes } = useStyles()
  const networkSelector = useSelector(currentNetwork)

  return (
    <TableContainer className={classes.tableContainer}>
      <Table className={classes.table}>
        <TableHead className={classes.tableHead}>
          <TableRow className={classes.headerRow}>
            <TableCell className={`${classes.headerCell} ${classes.pairNameHeaderCell}`}>
              Pair name
            </TableCell>
            {networkSelector === NetworkType.Mainnet && (
              <TableCell className={classes.headerCell}>Points</TableCell>
            )}
            <TableCell className={`${classes.headerCell} ${classes.narrowCell}`}>
              Fee tier
            </TableCell>
            <TableCell className={`${classes.headerCell} ${classes.wideCell}`}>
              Token ratio
            </TableCell>
            <TableCell className={`${classes.headerCell} ${classes.mediumCell}`}>Value</TableCell>
            <TableCell className={`${classes.headerCell} ${classes.mediumCell}`}>Fee</TableCell>
            <TableCell className={`${classes.headerCell} ${classes.chartCell}`}>Chart</TableCell>
            <TableCell className={`${classes.headerCell} ${classes.actionCell}`}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className={classes.tableBody}>
          {positions.map((position, index) => (
            <TableRow
              key={position.poolAddress.toString() + index}
              className={classes.tableBodyRow}>
              <PositionTableRow {...position} />
            </TableRow>
          ))}
        </TableBody>
        <TableFooter className={classes.tableFooter}>
          <TableRow className={classes.footerRow}>
            <TableCell className={classes.footerCell} />
            {networkSelector === NetworkType.Mainnet && (
              <TableCell className={classes.footerCell} />
            )}
            <TableCell className={classes.footerCell} />
            <TableCell className={classes.footerCell} />
            <TableCell className={classes.footerCell} />
            <TableCell className={classes.footerCell} />
            <TableCell className={classes.footerCell} />
            <TableCell className={classes.footerCell} />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

export default PositionsTable
