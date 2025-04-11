import React from 'react'
import { Popover, Box } from '@mui/material'
import useStyles from './styles'
import { FlowChartProps } from '@components/TransactionRoute/FlowChartGrid/types/types'
import TransactionRoute from '@components/TransactionRoute/TransactionRoute'

export interface ISelectWalletModal extends FlowChartProps {
  open: boolean
  handleClose: () => void

  // setIsOpenSelectWallet: (isOpen: boolean) => void
}

export const TransactionRouteModal: React.FC<ISelectWalletModal> = ({
  open,
  handleClose,
  routeData,
  isLoading
}) => {
  const { classes } = useStyles()

  return (
    <div className={classes.modalContainer}>
      <Popover
        open={open}
        marginThreshold={0}
        classes={{
          root: classes.popoverRoot,
          paper: classes.paper
        }}
        onClose={handleClose}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Box className={classes.root}>
          <TransactionRoute handleClose={handleClose} routeData={routeData} isLoading={isLoading} />
        </Box>
      </Popover>
    </div>
  )
}

export default TransactionRouteModal
