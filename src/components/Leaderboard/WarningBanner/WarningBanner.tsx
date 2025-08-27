import { closeWarningIcon, warning2Icon } from '@static/icons'
import useStyles from './styles'
import GradientBorder from '@common/GradientBorder/GradientBorder'
import { colors } from '@static/theme'
import { Grid } from '@mui/material'
import { useEffect, useRef, useState } from 'react'

interface INormalBannerProps {
  onClose: () => void
  isHiding: boolean
  lastTimestamp: Date
}

export const WarningBanner = ({ onClose, isHiding, lastTimestamp }: INormalBannerProps) => {
  const { classes } = useStyles({ isHiding })
  const contentRef = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(contentRef.current?.scrollHeight)

  const updateHeight = () => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight)
    }
  }

  useEffect(() => {
    updateHeight()

    window.addEventListener('resize', updateHeight)

    return () => {
      window.removeEventListener('resize', updateHeight)
    }
  }, [isHiding])

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
    <Grid
      container
      className={classes.mainWrapper}
      style={{
        height: isHiding ? 0 : `${contentRef.current ? height + 'px' : 'auto'}`,
        opacity: isHiding ? 0 : 1
      }}>
      <div ref={contentRef}>
        <Grid container className={classes.boxWrapper}>
          <GradientBorder
            borderColor={colors.invariant.warning}
            borderRadius={24}
            innerClassName={classes.container}
            borderWidth={2}
            opacity={1}>
            <span className={classes.text}>
              <img src={warning2Icon} className={classes.icon} />
              <span>
                <span>
                  Last update of Invariants Points - <b>{dateDisplay(lastTimestamp)}</b>
                </span>
                <br />
                <span>
                  Please note, <b>points are still being calculated correctly</b>, but there is a
                  temporary pause in updates. Updates will resume shortly.
                </span>
              </span>
            </span>

            <img
              className={classes.close}
              onClick={onClose}
              width={11}
              src={closeWarningIcon}
              alt='Close'
            />
          </GradientBorder>
        </Grid>
      </div>
    </Grid>
  )
}
