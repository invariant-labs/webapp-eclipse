import React, { useCallback, useState } from 'react'
import { Box } from '@mui/material'
import { UnclaimedFeeList } from '../UnclaimedFeeList/UnclaimedFeeList'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { useStyles } from './styles'
import { ProcessedPool } from '@store/types/userOverview'

interface OverviewProps {
  poolAssets: ProcessedPool[]
  isLoading?: boolean
}

export const Overview: React.FC<OverviewProps> = ({ poolAssets = [], isLoading = false }) => {
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

      <UnclaimedSection unclaimedTotal={totalUnclaimedFees} />

      <Box sx={{ marginTop: 2 }}>
        <UnclaimedFeeList
          fees={poolAssets}
          isLoading={isLoading}
          onValuesUpdate={handleValuesUpdate}
        />
      </Box>
    </Box>
  )
}
