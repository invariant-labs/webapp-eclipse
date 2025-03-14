import { useForm } from 'react-hook-form'
import useStyles from './styles'
import { Box, Typography } from '@mui/material'
import { TokenInfoInputs } from './CreatorComponents/TokenInfoInputs'
import { TokenMetadataInputs } from './CreatorComponents/TokenMetadataInputs'
import { BN } from '@coral-xyz/anchor'
import { NetworkType } from '@store/consts/static'
import { FormData } from '@store/consts/tokenCreator/types'

export interface ITokenCreator {
  onSubmit: (data: FormData) => void
  onConnectWallet: () => void
  buttonText: string
  success: boolean
  inProgress: boolean
  ethBalance: BN
  currentNetwork: NetworkType
}

export const TokenCreator: React.FC<ITokenCreator> = ({
  onSubmit,
  onConnectWallet,
  buttonText,
  success,
  inProgress,
  ethBalance,
  currentNetwork
}) => {
  const { classes } = useStyles()

  const formMethods = useForm<FormData>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      symbol: '',
      decimals: '',
      supply: '',
      description: '',
      website: '',
      twitter: '',
      telegram: '',
      discord: '',
      image: ''
    }
  })

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <Typography variant='h1' className={classes.headerTitle}>
            Create token
          </Typography>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Box className={classes.row}>
              <TokenInfoInputs
                formMethods={formMethods}
                buttonText={buttonText}
                success={success}
                inProgress={inProgress}
                ethBalance={ethBalance}
                currentNetwork={currentNetwork}
                onConnectWallet={onConnectWallet}
              />
              <TokenMetadataInputs formMethods={formMethods} />
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
