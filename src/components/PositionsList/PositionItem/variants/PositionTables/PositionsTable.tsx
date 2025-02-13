import React from 'react'
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import { PositionTableRow } from './PositionsTableRow'
import { IPositionItem } from '../../../types'
import { useNavigate } from 'react-router-dom'
import { usePositionTableStyle } from './styles/positionTable'

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
  const { classes } = usePositionTableStyle()
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
      </Table>
    </TableContainer>
  )
}

export default PositionsTable
