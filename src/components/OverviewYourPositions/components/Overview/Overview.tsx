import React, { useCallback, useMemo, useState } from 'react'
import { Box } from '@mui/material'
import { UnclaimedFeeList } from '../UnclaimedFeeList/UnclaimedFeeList'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { ProcessedPool } from '@components/OverviewYourPositions/types/types'
import { useStyles } from './styles'

interface OverviewProps {
  poolAssets: ProcessedPool[]
  isLoading?: boolean
  onClaimAll: () => void
  onClaimFee?: (feeId: number) => void
}

export const Overview: React.FC<OverviewProps> = ({
  poolAssets = [],
  isLoading = false,
  onClaimAll,
  onClaimFee
}) => {
  const { classes } = useStyles()
  const [totalValue, setTotalValue] = useState(0)
  const [totalUnclaimedFees, setTotalUnclaimedFees] = useState(0)

  const handleValuesUpdate = useCallback((newTotalValue: number, newTotalUnclaimedFees: number) => {
    setTotalValue(newTotalValue)
    setTotalUnclaimedFees(newTotalUnclaimedFees)
  }, [])

  return (
    <Box className={classes.container}>
      <HeaderSection totalValue={totalValue} />

      <UnclaimedSection unclaimedTotal={totalUnclaimedFees} onClaimAll={() => onClaimAll()} />

      <Box sx={{ marginTop: 2 }}>
        <UnclaimedFeeList
          fees={poolAssets}
          isLoading={isLoading}
          onClaimFee={onClaimFee}
          onValuesUpdate={handleValuesUpdate}
        />
      </Box>
    </Box>
  )
}
