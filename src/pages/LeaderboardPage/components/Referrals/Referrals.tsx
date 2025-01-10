import ReferralModal from '@components/Modals/RefferalModal/ReferralModal'
import { Box, Button } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { useState, useMemo } from 'react'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { useDispatch, useSelector } from 'react-redux'
import { status } from '@store/selectors/solanaWallet'

const Referrals = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const walletStatus = useSelector(status)

  const dispatch = useDispatch()

  const handleConnectWallet = () => {
    dispatch(walletActions.connect(false))
  }

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

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '20px' }}>
      <ReferralModal
        open={isModalOpen}
        onClose={onReferralModalClose}
        onConfirm={() => null}
        success={false}
        inProgress={false}
        referrerAddress={'asd'}
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
