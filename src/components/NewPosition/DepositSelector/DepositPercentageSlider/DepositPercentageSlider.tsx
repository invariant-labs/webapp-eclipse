import { Grid, Slider, SliderThumb } from '@mui/material'
import { useSliderStyles, useThumbStyles } from './style'

interface ThumbComponentProps extends React.HTMLAttributes<unknown> {
  disabled: boolean
}

function ThumbComponent({ disabled, ...props }: ThumbComponentProps) {
  const { classes } = useThumbStyles({ disabled })
  const { children, ...other } = props
  return (
    <SliderThumb {...other} aria-label='slider thumb'>
      {children}
      <Grid className={classes.outerCircle}>
        <Grid className={classes.innerCircle} />
      </Grid>
    </SliderThumb>
  )
}

interface IDepositPercentageSlider {
  depositPercentage: number
  setDepositPercentage: (value: number) => void
  isCustomAmounts: boolean
}

export const DepositPercentageSlider: React.FC<IDepositPercentageSlider> = ({
  depositPercentage,
  setDepositPercentage,
  isCustomAmounts
}) => {
  const { classes } = useSliderStyles({ depositPercentage, disabled: isCustomAmounts })

  return (
    <Slider
      min={0}
      max={100}
      marks={[{ value: 0 }, { value: 50 }, { value: 100 }]}
      classes={classes}
      slots={{ thumb: props => <ThumbComponent {...props} disabled={isCustomAmounts} /> }}
      track={false}
      valueLabelDisplay='on'
      valueLabelFormat={value => `${value}%`}
      onChange={e => setDepositPercentage(+(e.target as HTMLInputElement).value)}
      disabled={isCustomAmounts}
    />
  )
}
