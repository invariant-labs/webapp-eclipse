import { Typography, Box, Skeleton, Grid } from '@mui/material'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { useStyles } from './style'
import icons from '@static/icons'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'

interface HeaderSectionProps {
  totalValue: { value: number; isPriceWarning: boolean }
  loading?: boolean
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ totalValue, loading }) => {
  const { classes } = useStyles()

  return (
    <>
      <Box className={classes.headerRow}>
        <Typography className={classes.headerText}>Liquidity Assets</Typography>
        {loading ? (
          <>
            <Skeleton variant='text' width={100} height={24} />
          </>
        ) : (
          <Grid display='flex' flexDirection='row' alignItems='center' justifyContent='center'>
            <Typography className={classes.headerText}>
              $
              {Number.isNaN(totalValue)
                ? 0
                : formatNumberWithoutSuffix(totalValue.value, { twoDecimals: true })}
            </Typography>

            {totalValue.isPriceWarning && (
              <TooltipHover title='The price might not be shown correctly.'>
                <img src={icons.warning2} className={classes.warning} width={18} />
              </TooltipHover>
            )}
          </Grid>
        )}
      </Box>
    </>
  )
}
