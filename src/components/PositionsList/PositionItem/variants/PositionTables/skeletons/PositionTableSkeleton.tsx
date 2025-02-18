import React from 'react'
import {
  Box,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableRow
} from '@mui/material'
import { useDesktopSkeletonStyles } from './styles/desktopSkeleton'

export const PositionTableSkeleton: React.FC = () => {
  const { classes } = useDesktopSkeletonStyles()

  return (
    <Box className={classes.tableContainer}>
      <Table className={classes.table}>
        <TableHead className={classes.tableHead}>
          <TableRow className={classes.headerRow}>
            <TableCell className={classes.pairNameCell}>
              <Skeleton variant='text' width={100} height={24} />
            </TableCell>
            <TableCell className={classes.feeTierCell}>
              <Skeleton variant='text' width={60} height={24} />
            </TableCell>
            <TableCell className={classes.tokenRatioCell}>
              <Skeleton variant='text' width={80} height={24} />
            </TableCell>
            <TableCell className={classes.valueCell}>
              <Skeleton variant='text' width={60} height={24} />
            </TableCell>
            <TableCell className={classes.feeCell}>
              <Skeleton variant='text' width={60} height={24} />
            </TableCell>
            <TableCell className={classes.chartCell}>
              <Skeleton variant='text' width={80} height={24} />
            </TableCell>
            <TableCell className={classes.actionCell}>
              <Skeleton variant='text' width={36} height={24} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody className={classes.tableBody}>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <TableRow key={index} className={classes.bodyRow}>
                <TableCell className={classes.pairNameCell}>
                  <Box className={classes.skeletonContainer}>
                    <Skeleton variant='circular' width={40} height={40} />
                    <Skeleton variant='circular' width={40} height={40} />
                    <Skeleton
                      variant='rectangular'
                      width={160}
                      height={36}
                      sx={{ borderRadius: '10px' }}
                    />
                  </Box>
                </TableCell>
                <TableCell className={classes.feeTierCell}>
                  <Skeleton
                    variant='rectangular'
                    width='100%'
                    height={36}
                    sx={{ borderRadius: '10px', margin: '0 auto' }}
                  />
                </TableCell>
                <TableCell className={classes.tokenRatioCell}>
                  <Skeleton
                    variant='rectangular'
                    width='90%'
                    height={36}
                    sx={{ borderRadius: '10px', margin: '0 auto' }}
                  />
                </TableCell>
                <TableCell className={classes.valueCell}>
                  <Skeleton
                    variant='rectangular'
                    width='90%'
                    height={36}
                    sx={{ borderRadius: '10px', margin: '0 auto' }}
                  />
                </TableCell>
                <TableCell className={classes.feeCell}>
                  <Skeleton
                    variant='rectangular'
                    width='90%'
                    height={36}
                    sx={{ borderRadius: '10px', margin: '0 auto' }}
                  />
                </TableCell>
                <TableCell className={classes.chartCell}>
                  <Skeleton
                    variant='rectangular'
                    width='90%'
                    height={36}
                    sx={{ borderRadius: '10px', margin: '0 auto' }}
                  />
                </TableCell>
                <TableCell className={classes.actionCell}>
                  <Skeleton
                    variant='rectangular'
                    width={36}
                    height={36}
                    sx={{ borderRadius: '12px', margin: '0 auto' }}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        <TableFooter className={classes.tableFooter}>
          <TableRow className={classes.footerRow}>
            <TableCell className={`${classes.cellBase} ${classes.pairNameCell}`} />

            <TableCell className={`${classes.cellBase} ${classes.feeTierCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.tokenRatioCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.valueCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.feeCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.chartCell}`} />
            <TableCell className={`${classes.cellBase} ${classes.actionCell}`} />
          </TableRow>
        </TableFooter>
      </Table>
    </Box>
  )
}
