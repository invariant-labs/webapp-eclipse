import { Box } from '@mui/material'
import { FlowNode } from './components/FlowNode'
import { CellDefinition, FlowChartGridProps } from './types/types'

const GridCell = ({ children, colSpan = 1, rowSpan = 1 }) => {
  return (
    <Box
      sx={{
        gridColumn: `span ${colSpan}`,
        gridRow: `span ${rowSpan}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
      }}>
      {children}
    </Box>
  )
}

export const FlowChartGrid = ({ gridDefinition, cellSize = 80 }: FlowChartGridProps) => {
  const processedGrid = gridDefinition.map(row => {
    return row.map(cell => {
      if (!cell || cell.type !== 'node') return cell

      const newCell = { ...cell }

      if (!newCell.connectors) {
        newCell.connectors = []
      }

      return newCell
    })
  })

  const renderCellContent = (cell: CellDefinition | null) => {
    if (!cell || !cell.type) return null

    if (cell.type === 'node') {
      return (
        <FlowNode
          shape={cell.shape}
          bigNode={cell.bigNode}
          cornerPosition={cell.cornerPosition}
          textA={cell.textA}
          logoImg={cell.logoImg}
          arrowDirection={cell.arrowDirection}
          showTriangleArrow={cell.showTriangleArrow}
          dexInfo={cell.dexInfo}
          textB={cell.textB}
          labelPos={cell.labelPos}
          connectors={cell.connectors || []}
        />
      )
    }

    return null
  }

  const rows = processedGrid.length
  const cols = processedGrid.reduce((max, row) => Math.max(max, row.length), 0)

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
        gap: 0,
        marginRight: '30px',
        width: '100%'
      }}>
      {processedGrid.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <GridCell
            key={`cell-${rowIndex}-${colIndex}`}
            colSpan={cell?.colSpan || 1}
            rowSpan={cell?.rowSpan || 1}>
            {renderCellContent(cell)}
          </GridCell>
        ))
      )}
    </Box>
  )
}
