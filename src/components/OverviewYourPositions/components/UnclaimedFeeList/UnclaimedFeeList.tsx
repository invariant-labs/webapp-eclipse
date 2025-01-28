import React from 'react'
import { Box, Grid } from '@mui/material'
import classNames from 'classnames'
import { UnclaimedFee } from '@components/OverviewYourPositions/types/types'
import { UnclaimedFeeItem } from './UnclaimedFeeItem/UnclaimedFeeItem'
import { useStyles } from './styles'

interface UnclaimedFeeListProps {
  fees: UnclaimedFee[]
  isLoading?: boolean
  onClaimFee?: (feeId: number) => void
}

export const UnclaimedFeeList: React.FC<UnclaimedFeeListProps> = ({
  fees = [],
  isLoading = false,
  onClaimFee
}) => {
  const { classes } = useStyles()

  return (
    <Grid
      container
      direction='column'
      className={classNames(classes.container, { [classes.loadingOverlay]: isLoading })}>
      <Grid item className={classes.content}>
        <UnclaimedFeeItem type='header' />
        <Box className={classes.scrollContainer}>
          {fees.map((fee, index) => (
            <UnclaimedFeeItem
              key={fee.id}
              type='item'
              data={{
                index: index + 1,
                tokenX: fee.tokenX,
                tokenY: fee.tokenY,
                fee: fee.fee,
                value: fee.value,
                unclaimedFee: fee.unclaimedFee
              }}
              hideBottomLine={index === fees.length - 1}
              onClaim={() => onClaimFee?.(fee.id)}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  )
}
