import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import useStyles from './styles'
import { validateDecimals, validateSupply } from '../../utils/solanaCreatorUtils'
import { TokenInfoInputs } from '../CreatorComponents/TokenInfoInputs'
import { TokenMetadataInputs } from '../CreatorComponents/TokenMetadataInputs'
import { Box, Typography } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { network } from '@store/selectors/solanaConnection'
import { balance, status } from '@store/selectors/solanaWallet'
import { Status } from '@store/reducers/solanaWallet'
import { actions } from '@store/reducers/creator'
import { creatorState } from '@store/selectors/creator'

interface FormData {
  name: string
  symbol: string
  decimals: string
  supply: string
  description: string
  website: string
  twitter: string
  telegram: string
  discord: string
  image: string
}

export const CreateToken: React.FC = () => {
  const { classes } = useStyles()
  const currentNetwork = useSelector(network)
  const walletStatus = useSelector(status)
  const ethBalance = useSelector(balance)
  const { success, inProgress } = useSelector(creatorState)

  const dispatch = useDispatch()

  const isConnected = useMemo(() => walletStatus === Status.Initialized, [walletStatus])
  const buttonText = isConnected ? 'Create token' : 'Connect wallet'

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
  const onSubmit = (data: FormData) => {
    try {
      const decimalsError = validateDecimals(data.decimals)
      if (decimalsError) {
        throw new Error(decimalsError)
      }

      const supplyError = validateSupply(data.supply, data.decimals)
      if (supplyError) {
        throw new Error(supplyError)
      }

      dispatch(actions.createToken({ data, network: currentNetwork }))
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <Box className={classes.pageWrapper}>
      <Box className={classes.creatorMainContainer}>
        <Box className={classes.column}>
          <Typography variant='h1' className={classes.headerTitle}>
            Create token
          </Typography>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Box className={classes.row} gap='20px'>
              <TokenInfoInputs
                formMethods={formMethods}
                buttonText={buttonText}
                success={success}
                inProgress={inProgress}
                ethBalance={ethBalance}
                currentNetwork={currentNetwork}
              />
              <TokenMetadataInputs formMethods={formMethods} />
            </Box>
          </form>
        </Box>
      </Box>
    </Box>
  )
}
