import { Grid, Typography } from '@mui/material'
import useStyles from './styles'
import check from '@static/svg/checkRainbow.svg'
import airdrop from '@static/svg/airdropRainbow.svg'
import GradientBorder from '@components/GradientBorder/GradientBorder'

interface ExposureTooltipTitleProps {
  footerDescription?: string
  description?: string
  current?: number
  title: string
  max?: number
  img: string
}

export const ExposureTooltipTitle: React.FC<ExposureTooltipTitleProps> = ({
  footerDescription,
  description,
  current,
  title,
  img,
  max
}) => {
  const isFinished = max === current
  const isCommingSoon = !footerDescription && !description && !current
  const { classes } = useStyles({ isFinished })
  {
    return isCommingSoon ? (
      <Grid className={classes.tooltipWrapper}>
        <Grid alignItems='center' className={classes.header}>
          <img src={img} alt='project logo' />
          <Grid className={classes.title}>
            <Typography>{title}</Typography>
          </Grid>
        </Grid>
      </Grid>
    ) : (
      <Grid className={classes.tooltipWrapper}>
        <Grid className={classes.header}>
          <img src={img} alt='project logo' />
          <Grid className={classes.title}>
            <Typography>{title}</Typography>
            <Grid className={classes.progressWrapper}>
              <img src={check} alt='check icon' />
              <Typography>
                {current}/{max}
              </Typography>
            </Grid>
          </Grid>
        </Grid>

        <Typography className={classes.description}>{description}</Typography>
        <Grid width='fit-content'>
          <GradientBorder borderWidth={1} borderRadius={8}>
            <Grid className={classes.footer}>
              <img src={airdrop} alt='airdrop icon' />
              <Typography>{footerDescription}</Typography>
            </Grid>
          </GradientBorder>
        </Grid>
      </Grid>
    )
  }
}
