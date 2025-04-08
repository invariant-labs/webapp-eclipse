import { Typography, Box, Skeleton, Grid, useMediaQuery } from '@mui/material'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { useStyles } from './style'
import { TooltipHover } from '@common/TooltipHover/TooltipHover'
import icons from '@static/icons'
import { theme } from '@static/theme'

interface HeaderSectionProps {
  totalValue: { value: number; isPriceWarning: boolean }
  loading?: boolean
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ totalValue, loading }) => {
  const { classes } = useStyles()
  const isMd = useMediaQuery(theme.breakpoints.down('md'))

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
              <Grid position={'relative'}>
                <TooltipHover
                  title='The total value of assets might not be shown correctly'
                  left={isMd ? -134 : 'auto'}
                  top={-50}>
                  <img src={icons.warning2} className={classes.warning} width={18} />
                </TooltipHover>
              </Grid>
            )}
          </Grid>
        )}
      </Box>
    </>
  )
}
