import React, { useCallback, useEffect, useState } from 'react'
import { Box, Grid } from '@mui/material'
import classNames from 'classnames'
import { ProcessedPool } from '@components/OverviewYourPositions/types/types'
import { UnclaimedFeeItem } from './UnclaimedFeeItem/UnclaimedFeeItem'
import { useStyles } from './styles'

interface UnclaimedFeeListProps {
  fees: ProcessedPool[]
  isLoading?: boolean
  onClaimFee?: (feeId: string) => void
  onValuesUpdate?: (totalValue: number, totalUnclaimedFees: number) => void
}

export const UnclaimedFeeList: React.FC<UnclaimedFeeListProps> = ({
  fees = [],
  isLoading = false,
  onClaimFee,
  onValuesUpdate
}) => {
  const { classes } = useStyles()
  const [itemValues, setItemValues] = useState<
    Record<string, { value: number; unclaimedFee: number }>
  >({})

  useEffect(() => {
    const totalValue = Object.values(itemValues).reduce((sum, item) => sum + item.value, 0)
    const totalUnclaimedFees = Object.values(itemValues).reduce(
      (sum, item) => sum + item.unclaimedFee,
      0
    )
    onValuesUpdate?.(totalValue, totalUnclaimedFees)
  }, [itemValues, onValuesUpdate])

  const handleValueUpdate = useCallback((id: string, value: number, unclaimedFee: number) => {
    setItemValues(prev => ({
      ...prev,
      [id]: { value, unclaimedFee }
    }))
  }, [])

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
              key={fee.id.toString()}
              type='item'
              data={{
                id: fee.id,
                index: index + 1,
                tokenX: fee.tokenX,
                tokenY: fee.tokenY,
                fee: fee.fee
              }}
              onValueUpdate={handleValueUpdate}
              hideBottomLine={index === fees.length - 1}
            />
          ))}
        </Box>
      </Grid>
    </Grid>
  )
}
