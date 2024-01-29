import { Canvas } from '@components/Canvas/Canvas'
import { randomNumberFromRange } from '@consts/uiUtils'
import { Button, Grid, Input, Popover, Typography } from '@material-ui/core'
import { actions as walletActions } from '@reducers/solanaWallet'
import refreshIcon from '@static/svg/refresh.svg'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import useStyles from './styles'

export interface IProps {
  open: boolean
  anchorEl: HTMLButtonElement | null
  handleClose: () => void
}

export const Faucet: React.FC<IProps> = ({ anchorEl, open, handleClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()

  const [numberOne, setNumberOne] = useState(0)
  const [numberTwo, setNumberTwo] = useState(0)
  const [answer, setAnswer] = useState('')

  useEffect(() => {
    generateCaptcha()
  }, [])

  const generateCaptcha = () => {
    setNumberOne(randomNumberFromRange(1, 99))
    setNumberTwo(randomNumberFromRange(1, 99))
    setAnswer('')
  }

  const numbers = useMemo(() => {
    return [numberOne, numberTwo]
  }, [numberOne, numberTwo])

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
        <Grid
          className={classes.lowerRow}
          container
          direction='row'
          justifyContent='space-between'
          wrap='nowrap'>
          <Typography className={classes.title}>Add two numbers on screen</Typography>
          <Button onClick={generateCaptcha} className={classes.refreshIconBtn}>
            <img src={refreshIcon} className={classes.refreshIcon} />
          </Button>
        </Grid>
        <Canvas numbers={numbers} />
        <Grid
          className={classes.lowerRow}
          container
          direction='row'
          justifyContent='space-between'
          wrap='nowrap'>
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
            onClick={() => {
              if (numberOne + numberTwo === Number(answer)) {
                dispatch(walletActions.airdrop())
              } else {
                generateCaptcha()
              }
            }}
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
