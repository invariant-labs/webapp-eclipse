import { Button, Typography } from '@mui/material'
import useStyles from './style'
import icons from '@static/icons'
import { useEffect, useState } from 'react'

interface Props {
  rpcAddress: string
  useDefaultRpc: () => void
  useCurrentRpc: () => void
}

export const RpcErrorModal: React.FC<Props> = ({ rpcAddress, useDefaultRpc, useCurrentRpc }) => {
  const [rpc] = useState(rpcAddress)
  const [height, setHeight] = useState(document.body.scrollHeight)

  useEffect(() => {
    const handleResize = () => setHeight(document.body.scrollHeight)
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const { classes } = useStyles()

  return (
    <>
      <div className={classes.background} style={{ height: height }}></div>
      <div className={classes.container}>
        <img className={classes.warningIcon} src={icons.warningIcon} alt='Warning icon' />
        <Typography className={classes.title}>RPC Connection Error</Typography>
        <div className={classes.textContainer}>
          <Typography className={classes.rpcText}>
            Your RPC might not be working due to one of the following reasons:
            <ul>
              <li>The RPC server is down or not responding.</li>
              <li>Your RPC subscription expired, causing the server to stop working.</li>
              <li>Your RPC plan may not support certain calls.</li>
            </ul>
          </Typography>
          <Typography className={classes.currentRpcText}>
            Current RPC: <span className={classes.currentRpc}>{rpc}</span>
          </Typography>
        </div>
        <div className={classes.buttonsContainer}>
          <Button className={classes.mainButton} onClick={useDefaultRpc}>
            Change to default RPC
          </Button>
          <Button className={classes.otherButton} onClick={useCurrentRpc}>
            Use current RPC anyway
          </Button>
        </div>
      </div>
    </>
  )
}
