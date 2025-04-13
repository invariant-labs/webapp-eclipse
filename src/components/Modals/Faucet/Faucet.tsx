import { Canvas } from '@common/Canvas/Canvas'
import { actions as snackbarsActions } from '@store/reducers/snackbars'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import useStyles from './styles'
import { randomNumberFromRange } from '@utils/utils'
import { Button, Grid, Input, Popover, Typography } from '@mui/material'
import { refreshIcon } from '@static/icons'

export interface IProps {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
  onFaucet: () => void
}

export const Faucet: React.FC<IProps> = ({ anchorEl, open, handleClose, onFaucet }) => {
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const [numberOne, setNumberOne] = useState(0)
  const [numberTwo, setNumberTwo] = useState(0)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    if (open) {
      generateCaptcha()
    }
  }, [open])

  const generateCaptcha = () => {
    setNumberOne(randomNumberFromRange(1, 99))
    setNumberTwo(randomNumberFromRange(1, 99))
    setAnswer('')
  }

  const numbers = useMemo(() => {
    return [numberOne, numberTwo]
  }, [numberOne, numberTwo])

  const handleCaptcha = () => {
    const sumMatchesAnswer = numberOne + numberTwo === Number(answer)
    const concatMatchesAnswer = numberOne.toString() + numberTwo.toString() === answer
    const reversedConcactMatchesAnswer = numberTwo.toString() + numberOne.toString() === answer

    if (sumMatchesAnswer || concatMatchesAnswer || reversedConcactMatchesAnswer) {
      onFaucet()
      handleClose()
    } else {
      dispatch(
        snackbarsActions.add({
          message: 'Captcha failed. Please try again',
          variant: 'error',
          persist: false
        })
      )
    }
    generateCaptcha()
  }

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      classes={{ paper: classes.paper }}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}>
      <Grid className={classes.root}>
        <Grid className={classes.lowerRow} container>
          <Typography className={classes.title}>
            Please input the result of adding these two values:
          </Typography>
          <Button onClick={generateCaptcha} className={classes.refreshIconBtn}>
            <img src={refreshIcon} className={classes.refreshIcon} />
          </Button>
        </Grid>
        <Canvas numbers={numbers} />
        <Grid className={classes.lowerRow} container>
          <Input
            className={classes.input}
            type='number'
            classes={{
              input: classes.innerInput
            }}
            placeholder='Answer'
            onChange={e => setAnswer(e.target.value)}
            value={answer}
            disableUnderline
          />
          <Button
            className={classes.add}
            onClick={handleCaptcha}
            disableRipple
            disabled={answer === ''}>
            Get
          </Button>
        </Grid>
      </Grid>
    </Popover>
  )
}

export default Faucet
