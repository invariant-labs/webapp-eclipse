import ReferralModal from '@components/Modals/RefferalModal/ReferralModal'
import { Box, Button, TextField } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { useState, useMemo, useEffect } from 'react'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { useDispatch, useSelector } from 'react-redux'
import { status } from '@store/selectors/solanaWallet'
import { proceeding, success } from '@store/selectors/referral'
import { actions } from '@store/reducers/referral'
import SelectWalletModal from '@components/Modals/SelectWalletModal/SelectWalletModal'

const Referrals = () => {
  const [code, setCode] = useState<string>('')
  const address = 'mocked string'
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isOpenSelectWalletModal, setIsOpenSelectWalletModal] = useState<boolean>(false)
  const walletStatus = useSelector(status)

  const dispatch = useDispatch()

  const handleConnectWallet = () => {
    setIsOpenSelectWalletModal(true)
    setIsModalOpen(false)
  }
  const inProgress = useSelector(proceeding)
  const succed = useSelector(success)

  const connected = useMemo(() => {
    return walletStatus === Status.Initialized
  }, [walletStatus])

  const onReferralModalOpen = () => {
    setIsModalOpen(true)
    blurContent()
  }

  const onReferralModalClose = () => {
    setIsModalOpen(false)
    unblurContent()
  }

  useEffect(() => {
    if (succed && !inProgress) {
      onReferralModalClose()
    }
  }, [succed, inProgress])

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
      <SelectWalletModal
        anchorEl={null}
        handleClose={() => {
          setIsOpenSelectWalletModal(false)
          unblurContent()
        }}
        setIsOpenSelectWallet={() => {
          setIsOpenSelectWalletModal(false)
          unblurContent()
        }}
        handleConnect={() => dispatch(walletActions.connect(false))}
        open={isOpenSelectWalletModal}
        isChangeWallet={false}
        onDisconnect={() => null}
      />
      <ReferralModal
        open={isModalOpen}
        onClose={onReferralModalClose}
        onConfirm={() => dispatch(actions.useCode({ code }))}
        success={succed}
        inProgress={inProgress}
        referrerAddress={address}
        connected={connected}
        handleConnectWallet={handleConnectWallet}
      />
      <Button
        sx={{ width: '150px', height: '40px' }}
        onClick={() => dispatch(actions.getUserCode())}>
        GET CODE
      </Button>
      <TextField value={code} onChange={e => setCode(e.target.value)} />
      <Button sx={{ width: '150px', height: '40px' }} onClick={onReferralModalOpen}>
        USE CODE
      </Button>
    </Box>
  )
}

export default Referrals
