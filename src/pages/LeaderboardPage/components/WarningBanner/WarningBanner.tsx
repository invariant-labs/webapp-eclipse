import icons from '@static/icons'
import useStyles from './styles'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors } from '@static/theme'
import { Grid } from '@mui/material'

interface INormalBannerProps {
  onClose: () => void
  isHiding: boolean
}

export const WarningBanner = ({ onClose, isHiding }: INormalBannerProps) => {
  const { classes } = useStyles({ isHiding })

  return (
    <Grid container alignItems='center' justifyContent='center' mb={6}>
      <GradientBorder
        borderColor={colors.invariant.warning}
        borderRadius={24}
        innerClassName={classes.container}
        borderWidth={isHiding ? 0 : 2}
        opacity={1}>
        <span className={classes.text}>
          <img src={icons.warning2} className={classes.icon} />
          <span>
            We are currently having difficulties with refreshing the data, please be patient while
            we fix the ocuring problem!
          </span>
        </span>

        <img
          className={classes.close}
          onClick={onClose}
          width={11}
          src={icons.closeWarning}
          alt='Close'
        />
      </GradientBorder>
    </Grid>
  )
}
