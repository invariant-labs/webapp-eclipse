import { Typography, Box, Skeleton } from '@mui/material'
import { useStyles } from '../Overview/styles'
import { formatNumberWithoutSuffix } from '@utils/utils'
import { typography, theme, colors } from '@static/theme'

interface HeaderSectionProps {
  totalValue: number
  loading?: boolean
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({ totalValue, loading }) => {
  const { classes } = useStyles()

  return (
    <>
      <Box className={classes.headerRow}>
        <Typography className={classes.headerText}>Assets in Tokens</Typography>
        {loading ? (
          <>
            <Skeleton
              variant='text'
              width={100}
              height={24}
              sx={{
                bgcolor: colors.invariant.light,
                ...typography.heading1,
                [theme.breakpoints.down('lg')]: {
                  marginTop: '16px'
                }
              }}
            />
          </>
        ) : (
          <Typography className={classes.headerText}>
            $
            {Number.isNaN(totalValue)
              ? 0
              : formatNumberWithoutSuffix(totalValue, { twoDecimals: true })}
          </Typography>
        )}
      </Box>
    </>
  )
}
