import React from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow
} from '@mui/material'
import { PositionTableRow } from './PositionsTableRow'
import { IPositionItem } from '../../../types'
import { useNavigate } from 'react-router-dom'
import { usePositionTableStyle } from './styles/positionTable'
import { EmptyPlaceholder } from '@components/EmptyPlaceholder/EmptyPlaceholder'

interface IPositionsTableProps {
  positions: Array<IPositionItem>
  isLockPositionModalOpen: boolean
  setIsLockPositionModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  noInitialPositions?: boolean
  onAddPositionClick?: () => void
  isLoading?: boolean
}

const generateLoadingData = () => {
  const getRandomNumber = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min

  return Array(5)
    .fill(null)
    .map((_, index) => {
      const currentPrice = Math.random() * 10000

      return {
        id: `loading-${index}`,
        poolAddress: `pool-${index}`,
        tokenXName: 'FOO',
        tokenYName: 'BAR',
        tokenXIcon: undefined,
        tokenYIcon: undefined,
        currentPrice,
        fee: getRandomNumber(1, 10) / 10,
        min: currentPrice * 0.8,
        max: currentPrice * 1.2,
        position: getRandomNumber(1000, 10000),
        valueX: getRandomNumber(1000, 10000),
        valueY: getRandomNumber(1000, 10000),
        poolData: {},
        isActive: Math.random() > 0.5,
        tokenXLiq: getRandomNumber(100, 1000),
        tokenYLiq: getRandomNumber(10000, 100000),
        network: 'mainnet'
      }
    })
}

export const PositionsTable: React.FC<IPositionsTableProps> = ({
  positions,
  isLockPositionModalOpen,
  setIsLockPositionModalOpen,
  noInitialPositions,
  onAddPositionClick,
  isLoading = false
}) => {
  const { classes } = usePositionTableStyle({ isScrollHide: positions.length <= 5 || isLoading })
  const navigate = useNavigate()

  const displayData = isLoading ? generateLoadingData() : positions

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
        {!isLoading && positions.length === 0 ? (
          <Box className={classes.tableBody}>
            <Box className={classes.emptyContainer}>
              <Box className={classes.emptyWrapper}>
                <EmptyPlaceholder
                  newVersion
                  height='408px'
                  desc={
                    noInitialPositions
                      ? 'Add your first position by pressing the button and start earning!'
                      : 'Did not find any matching positions'
                  }
                  onAction={onAddPositionClick}
                  withButton={noInitialPositions}
                />
              </Box>
            </Box>
          </Box>
        ) : (
          <TableBody className={classes.tableBody}>
            {displayData.map((position, index) => (
              <TableRow
                onClick={e => {
                  if (
                    !isLoading &&
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
                  loading={isLoading}
                />
              </TableRow>
            ))}
          </TableBody>
        )}
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
    </TableContainer>
  )
}
