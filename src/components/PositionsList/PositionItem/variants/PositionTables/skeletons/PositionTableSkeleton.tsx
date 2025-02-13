import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Skeleton
} from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { colors } from '@static/theme'

const useStyles = makeStyles()(() => ({
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
  baseCell: {
    padding: '14px 20px',
    background: 'inherit',
    border: 'none',
    whiteSpace: 'nowrap',
    textAlign: 'left'
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
    textAlign: 'left'
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
  tableHead: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  tableBody: {
    display: 'block',
    maxHeight: 'calc(4 * (20px + 85px))',
    overflowY: 'auto',
    borderBottomLeftRadius: '24px',
    borderBottomRightRadius: '24px',
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
  bodyRow: {
    display: 'table',
    width: '100%',
    height: '105px',
    tableLayout: 'fixed',
    '&:nth-of-type(odd)': {
      background: colors.invariant.component
    },
    '&:nth-of-type(even)': {
      background: `${colors.invariant.component}80`
    }
  },
  tableFooter: {
    display: 'table',
    width: '100%',
    tableLayout: 'fixed'
  },
  // Cell width styles
  pairNameCell: {
    width: '25%',
    textAlign: 'left',
    padding: '14px 41px 14px 22px !important'
  },
  feeTierCell: {
    width: '12%'
  },
  tokenRatioCell: {
    width: '15%'
  },
  valueCell: {
    width: '10%'
  },
  feeCell: {
    width: '10%'
  },
  chartCell: {
    width: '16%'
  },
  actionCell: {
    width: '4%',
    padding: '14px 8px'
  }
}))

const PositionsTableSkeleton = () => {
  const { classes, cx } = useStyles()
  const rows = [1, 2, 3, 4]

  return (
    <TableContainer className={classes.tableContainer}>
      <Table className={classes.table}>
        <TableHead className={classes.tableHead}>
          <TableRow className={classes.headerRow}>
            <TableCell className={cx(classes.headerCell, classes.pairNameCell)}>
              Pair name
            </TableCell>
            <TableCell className={cx(classes.headerCell, classes.feeTierCell)}>Fee tier</TableCell>
            <TableCell className={cx(classes.headerCell, classes.tokenRatioCell)}>
              Token ratio
            </TableCell>
            <TableCell className={cx(classes.headerCell, classes.valueCell)}>Value</TableCell>
            <TableCell className={cx(classes.headerCell, classes.feeCell)}>Fee</TableCell>
            <TableCell className={cx(classes.headerCell, classes.chartCell)}>Chart</TableCell>
            <TableCell className={cx(classes.headerCell, classes.actionCell)}>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody className={classes.tableBody}>
          {rows.map(row => (
            <TableRow key={row} className={classes.bodyRow}>
              <TableCell className={cx(classes.baseCell, classes.pairNameCell)}>
                <Skeleton
                  variant='rectangular'
                  width='100%'
                  height={30}
                  sx={{ borderRadius: '8px' }}
                />
              </TableCell>
              <TableCell className={cx(classes.baseCell, classes.feeTierCell)}>
                <Skeleton variant='rounded' sx={{ borderRadius: '8px' }} width='100%' height={30} />
              </TableCell>
              <TableCell className={cx(classes.baseCell, classes.tokenRatioCell)}>
                <Skeleton
                  variant='rectangular'
                  sx={{ borderRadius: '8px' }}
                  width='100%'
                  height={30}
                />
              </TableCell>
              <TableCell className={cx(classes.baseCell, classes.valueCell)}>
                <Skeleton
                  variant='rectangular'
                  sx={{ borderRadius: '8px' }}
                  width='100%'
                  height={30}
                />
              </TableCell>
              <TableCell className={cx(classes.baseCell, classes.feeCell)}>
                <Skeleton
                  variant='rectangular'
                  sx={{ borderRadius: '8px' }}
                  width='100%'
                  height={30}
                />
              </TableCell>
              <TableCell className={cx(classes.baseCell, classes.chartCell)}>
                <Skeleton
                  variant='rectangular'
                  width='100%'
                  height={32}
                  sx={{ borderRadius: '8px' }}
                />
              </TableCell>
              <TableCell className={cx(classes.baseCell, classes.actionCell)}>
                <Skeleton variant='rounded' width={36} height={36} sx={{ margin: '0 auto' }} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default PositionsTableSkeleton
