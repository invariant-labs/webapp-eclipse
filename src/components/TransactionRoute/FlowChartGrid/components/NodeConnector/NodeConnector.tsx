import React from 'react'
import { Box } from '@mui/material'
import { NodeConnectorProps } from '../../types/types'
import { getConnectorStyles } from '../../utils/getConnectorStyles'

export const NodeConnector: React.FC<NodeConnectorProps> = ({
  direction = 'right',
  withArrow = false,
  shape,
  longerConnector = false
}) => {
  const styles = getConnectorStyles({
    direction,
    longerConnector,
    shape,
    withArrow
  })

  if (!styles.container) return null

  return (
    <Box sx={styles.container}>
      {styles.line && <Box sx={styles.line} />}
      {styles.line1 && <Box sx={styles.line1} />}
      {styles.line2 && <Box sx={styles.line2} />}
      {styles.arrow && <Box sx={styles.arrow} />}
    </Box>
  )
}
