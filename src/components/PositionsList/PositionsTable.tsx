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
    background: 'transparent',
    boxShadow: 'none'
  },
  table: {
    borderCollapse: 'separate',
    maxWidth: '950px' // Set minimum width to prevent content from breaking
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
    width: '25%' // Allocate percentage width
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
    width: '8%' // Percentage-based width
  },
  mediumCell: {
    width: '10%' // Percentage-based width
  },
  wideCell: {
    width: '15%' // Percentage-based width
  },
  chartCell: {
    width: '20%' // Percentage-based width
  },
  actionCell: {
    width: '4%' // Percentage-based width
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
        <TableHead>
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
        <TableBody>
          {positions.map((position, index) => (
            <PositionTableRow
              key={position.poolAddress.toString() + index}
              {...position}
              isLastRow={index === positions.length - 1}
            />
          ))}
        </TableBody>
        <TableFooter>
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
