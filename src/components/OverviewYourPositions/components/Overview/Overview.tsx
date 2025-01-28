import React, { useMemo } from 'react'
import { Box } from '@mui/material'
import { UnclaimedFeeList } from '../UnclaimedFeeList/UnclaimedFeeList'
import { HeaderSection } from '../HeaderSection/HeaderSection'
import { UnclaimedSection } from '../UnclaimedSection/UnclaimedSection'
import { UnclaimedFee } from '@components/OverviewYourPositions/types/types'
import { useStyles } from './styles'

interface OverviewProps {
  poolAssets: UnclaimedFee[]
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

  const totalValue = useMemo(
    () => poolAssets.reduce((sum, asset) => sum + asset.value, 0),
    [poolAssets]
  )

  const totalUnclaimedFees = useMemo(
    () => poolAssets.reduce((sum, asset) => sum + asset.unclaimedFee, 0),
    [poolAssets]
  )

  return (
    <Box className={classes.container}>
      <HeaderSection totalValue={totalValue} />

      <UnclaimedSection unclaimedTotal={totalUnclaimedFees} onClaimAll={() => onClaimAll()} />

      <Box sx={{ marginTop: 2 }}>
        <UnclaimedFeeList fees={poolAssets} isLoading={isLoading} onClaimFee={onClaimFee} />
      </Box>
    </Box>
  )
}
