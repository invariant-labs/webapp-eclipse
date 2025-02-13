import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton
} from '@mui/material'
import { useDesktopSkeletonStyles } from './styles/desktopSkeleton'

const PositionsTableSkeleton = () => {
  const { classes, cx } = useDesktopSkeletonStyles()
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
