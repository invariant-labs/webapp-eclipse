import { useCallback, useMemo, useState } from 'react'
import { Dialog, Grid, Typography } from '@mui/material'
import { Button } from '@common/Button/Button'
import useStyles from './style'
import { closeSmallIcon, warning3 } from '@static/icons'
import { unblurContent } from '@utils/uiUtils'

export const useConfirm = (title: string, msg: string | React.ReactNode) => {
  const [state, setState] = useState<{ resolve: (v: boolean) => void } | null>(null)

  const confirm = useCallback(() => new Promise<boolean>(resolve => setState({ resolve })), [])

  const handleClose = useCallback(() => {
    setState(null)
    unblurContent()
  }, [])
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
        <img onClick={handleCancel} className={classes.closeButton} src={closeSmallIcon} />
        <Typography component='h2'>{title}</Typography>
        <Typography>{msg}</Typography>
        <Grid className={classes.unknownWarning}>
          <img className={classes.warningIcon} src={warning3} />
          <Typography component='span'>
            {' '}
            This action might be harmful to your portfolio and end in lose.
          </Typography>
        </Grid>
        <Grid className={classes.buttonRow}>
          <Button width='100%' height={47} scheme='grey' onClick={handleCancel}>
            Decline
          </Button>
          <Button width='100%' height={47} scheme='pink' onClick={handleOk}>
            Confirm
          </Button>
        </Grid>
      </Dialog>
    ),
    [state, title, msg, handleCancel, handleOk]
  )

  return [ConfirmDialog, confirm] as const
}
