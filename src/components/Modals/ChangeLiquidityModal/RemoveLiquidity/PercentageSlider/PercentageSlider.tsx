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

interface IPercentageSlider {
  value: number
  onChange: (value: number) => void
}

export const PercentageSlider: React.FC<IPercentageSlider> = ({ value, onChange }) => {
  const { classes } = useSliderStyles({ value })

  return (
    <Slider
      value={value}
      min={0}
      max={100}
      marks={[{ value: 0 }, { value: 25 }, { value: 50 }, { value: 75 }, { value: 100 }]}
      classes={classes}
      slots={{ thumb: props => <ThumbComponent {...props} /> }}
      track={false}
      valueLabelDisplay='on'
      valueLabelFormat={value => `${value}%`}
      onChange={e => onChange(+(e.target as HTMLInputElement).value)}
    />
  )
}
