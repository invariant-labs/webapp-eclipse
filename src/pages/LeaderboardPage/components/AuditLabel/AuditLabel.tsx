import { Box, Typography } from '@mui/material'
import { colors, typography } from '@static/theme'
import icons from '@static/icons'
export const AuditLabel = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        margin: '20px 0',
        alignItems: 'center'
      }}>
      <img src={icons.auditIcon} alt='Shield' />
      <Typography style={{ color: colors.invariant.text, ...typography.body3, marginLeft: '8px' }}>
        Audited by Sec3
      </Typography>
    </Box>
  )
}
