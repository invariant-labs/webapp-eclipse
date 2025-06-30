import { useCallback, useMemo, useState } from 'react'
import { Dialog, Grid, Typography } from '@mui/material'
import { Button } from '@common/Button/Button'
import useStyles from './style'

export const useConfirm = (title: string, msg: string | React.ReactNode) => {
  const [state, setState] = useState<{ resolve: (v: boolean) => void } | null>(null)

  const confirm = useCallback(() => new Promise<boolean>(resolve => setState({ resolve })), [])

  const handleClose = useCallback(() => setState(null), [])
  const handleCancel = useCallback(() => {
    state?.resolve(false)
    handleClose()
  }, [state])
  const handleOk = useCallback(() => {
    state?.resolve(true)
    handleClose()
  }, [state])
  const { classes } = useStyles()

  const ConfirmDialog = useMemo(
    () => (
      <Dialog
        PaperProps={{ className: classes.paper }}
        open={state !== null}
        keepMounted
        onClose={handleCancel}>
        <Typography component='h2'>{title}</Typography>
        <Typography>{msg}</Typography>
        <Grid className={classes.buttonRow}>
          <Button width={80} scheme='pink' onClick={handleCancel}>
            Cancel
          </Button>
          <Button width={80} scheme='green' onClick={handleOk}>
            Confirm
          </Button>
        </Grid>
      </Dialog>
    ),
    [state, title, msg, handleCancel, handleOk]
  )

  return [ConfirmDialog, confirm] as const
}
