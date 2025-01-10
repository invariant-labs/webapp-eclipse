import ReferralModal from '@components/Modals/RefferalModal/ReferralModal'
import { Box, Button } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { useState, useMemo, useEffect } from 'react'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { useDispatch, useSelector } from 'react-redux'
import { status } from '@store/selectors/solanaWallet'
import { proceeding, success } from '@store/selectors/referral'
import { actions } from '@store/reducers/referral'

const Referrals = () => {
  const address = 'mocked string'
  const code = ''
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const walletStatus = useSelector(status)

  const dispatch = useDispatch()

  const handleConnectWallet = () => {
    dispatch(walletActions.connect(false))
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
      <Button sx={{ width: '150px', height: '40px' }} onClick={onReferralModalOpen}>
        OPEN MODAL
      </Button>
    </Box>
  )
}

export default Referrals
