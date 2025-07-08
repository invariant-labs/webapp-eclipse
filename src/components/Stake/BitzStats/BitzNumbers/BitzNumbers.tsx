import { Separator } from '@common/Separator/Separator'
import { Grid, Skeleton, Typography } from '@mui/material'
import useStyles from './style'
import { colors } from '@static/theme'
import React from 'react'
import { formatNumberWithCommas } from '@utils/utils'

interface BitzNumbersProps {
  isLoading: boolean
  marketCap: number
  supply: number
  holder: number
}

export const BitzNumbers: React.FC<BitzNumbersProps> = ({
  isLoading,
  marketCap,
  supply,
  holder
}) => {
  const { classes } = useStyles()
  return (
    <Grid className={classes.sectionWrapper}>
      <Grid className={classes.statWrapper}>
        <Typography component='h4'>Market Cap</Typography>
        {isLoading ? (
          <Skeleton height={28} variant='rounded' width={200} />
        ) : (
          <Typography component='h3'>${formatNumberWithCommas(marketCap.toFixed(2))}</Typography>
        )}{' '}
        <Separator margin='12px' size='100%' isHorizontal color={colors.invariant.light} />
      </Grid>
      <Grid className={classes.statWrapper}>
        <Typography component='h4'>Supply</Typography>
        {isLoading ? (
          <Skeleton variant='rounded' height={28} width={200} />
        ) : (
          <Typography component='h3'>{formatNumberWithCommas(supply.toFixed(2))}</Typography>
        )}
        <Separator margin='12px' size='100%' isHorizontal color={colors.invariant.light} />
      </Grid>
      <Grid className={classes.statWrapper}>
        <Typography component='h4'>Holders</Typography>
        {isLoading ? (
          <Skeleton height={28} variant='rounded' width={200} />
        ) : (
          <Typography component='h3'>{formatNumberWithCommas(holder.toString())}</Typography>
        )}
      </Grid>
    </Grid>
  )
}
