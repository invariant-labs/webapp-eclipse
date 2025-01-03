import icons from '@static/icons'
import useStyles from './styles'
import GradientBorder from '@components/GradientBorder/GradientBorder'
import { colors } from '@static/theme'
import { Grid } from '@mui/material'

interface INormalBannerProps {
  onClose: () => void
  isHiding: boolean
  lastTimestamp: Date
}

export const WarningBanner = ({ onClose, isHiding, lastTimestamp }: INormalBannerProps) => {
  const { classes } = useStyles({ isHiding })

  const dateDisplay = (date: Date) => {
    const formattedDate = date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    return formattedDate
  }

  return (
    <Grid container alignItems='center' justifyContent='center' mb={6}>
      <GradientBorder
        borderColor={colors.invariant.warning}
        borderRadius={24}
        innerClassName={classes.container}
        borderWidth={isHiding ? 0 : 2}
        opacity={isHiding ? 0 : 1}>
        <span className={classes.text}>
          <img src={icons.warning2} className={classes.icon} />
          <span>
            <span>
              Last update of Invariants Points - <b>{dateDisplay(lastTimestamp)}</b>
            </span>
            <br />
            <span>
              Please note, points are still being calculated correctly, but there is a temporary
              pause in updates. Updates will resume shortly.
            </span>
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
