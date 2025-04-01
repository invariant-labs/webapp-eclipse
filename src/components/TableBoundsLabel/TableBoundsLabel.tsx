import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { theme } from '@static/theme'
import React from 'react'
import { useStyles } from './style'

interface ITableBoundsLabel {
  lowerBound: number
  totalItems: number
  upperBound: number
  containerPadding?: number | string
  containerHeight?: number | string
  children: React.JSX.Element
}

export const TableBoundsLabel: React.FC<ITableBoundsLabel> = ({
  totalItems,
  children,
  lowerBound,
  containerPadding,
  containerHeight,
  upperBound
}) => {
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'))
  const { classes } = useStyles({ isMobile, containerPadding, containerHeight })

  return (
    <>
      <Box className={classes.container}>
        <Grid container className={classes.gridContainer}>
          <Grid item className={classes.paginatorContainer}>
            <Box className={classes.paginatorBox}>{children}</Box>
          </Grid>

          <Grid item className={classes.labelContainer}>
            <Typography className={classes.labelText}>
              Showing {lowerBound}-{upperBound} of {totalItems}
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
