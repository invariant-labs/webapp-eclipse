import ReferralModal from '@components/Modals/RefferalModal/ReferralModal'
import { Box, Button } from '@mui/material'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { useState } from 'react'

const Referrals = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

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
      />
      <Button sx={{ width: '150px', height: '40px' }} onClick={onReferralModalOpen}>
        OPEN MODAL
      </Button>
    </Box>
  )
}

export default Referrals
