import NavbarButton from '@components/Navbar/NavbarButton'
import DotIcon from '@mui/icons-material/FiberManualRecordRounded'
import { Box, CardMedia, Grid, IconButton, useMediaQuery } from '@mui/material'
import icons from '@static/icons'
import Hamburger from '@static/svg/Hamburger.svg'
import { theme } from '@static/theme'
import { RPC, NetworkType } from '@store/consts/static'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ChangeWalletButton from './HeaderButton/ChangeWalletButton'
import useStyles from './style'
import { ISelectChain, ISelectNetwork } from '@store/consts/types'
import { RpcStatus } from '@store/reducers/solanaConnection'
import RoutesModal from '@components/Modals/RoutesModal/RoutesModal'
import { PublicKey } from '@solana/web3.js'
import FaucetButton from './HeaderButton/FaucetButton'
import { YourPointsButton } from './HeaderButton/YourPointsButton'
import { BN } from '@coral-xyz/anchor'
import SocialModal from '@components/Modals/SocialModal/SocialModal'
import { Bar } from '@components/Bar/Bar'

export interface IHeader {
  address: PublicKey
  onNetworkSelect: (networkType: NetworkType, rpcAddress: string, rpcName?: string) => void
  onConnectWallet: () => void
  walletConnected: boolean
  landing: string
  typeOfNetwork: NetworkType
  rpc: string
  onFaucet: () => void
  onDisconnectWallet: () => void
  defaultTestnetRPC: string
  onCopyAddress: () => void
  activeChain: ISelectChain
  onChainSelect: (chain: ISelectChain) => void
  network: NetworkType
  defaultDevnetRPC: string
  defaultMainnetRPC: string
  rpcStatus: RpcStatus
  walletBalance: BN | null
}

export const Header: React.FC<IHeader> = ({
  address,
  onNetworkSelect,
  onConnectWallet,
  walletConnected,
  landing,
  typeOfNetwork,
  rpc,
  onFaucet,
  onDisconnectWallet,
  onCopyAddress,
  onChainSelect,
  network,
  walletBalance
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))

  const routes = [
    'exchange',
    'liquidity',
    'portfolio',
    ...(typeOfNetwork === NetworkType.Testnet ? ['creator'] : []),
    ...(typeOfNetwork === NetworkType.Mainnet ? ['points'] : []),
    'statistics'
  ]

  const otherRoutesToHighlight: Record<string, RegExp[]> = {
    liquidity: [/^liquidity\/*/],
    exchange: [/^exchange\/*/],
    portfolio: [/^portfolio\/*/, /^newPosition\/*/, /^position\/*/],

    ...(typeOfNetwork === NetworkType.Mainnet ? { leaderboard: [/^points\/*/] } : {}),
    ...(typeOfNetwork === NetworkType.Testnet ? { creator: [/^creator\/*/] } : {})
  }

  const [activePath, setActive] = useState('exchange')

  const [routesModalOpen, setRoutesModalOpen] = useState(false)
  const [viewSocialsOpen, setViewSocialsOpen] = useState(false)

  const [routesModalAnchor, setRoutesModalAnchor] = useState<HTMLButtonElement | null>(null)

  useEffect(() => {
    setActive(landing)
  }, [landing])

  const testnetRPCs: ISelectNetwork[] = [
    {
      networkType: NetworkType.Testnet,
      rpc: RPC.TEST,
      rpcName: 'Eclipse Testnet'
    }
  ]

  const mainnetRPCs: ISelectNetwork[] = [
    {
      networkType: NetworkType.Mainnet,
      rpc: RPC.MAIN_TRITON,
      rpcName: 'Triton'
    },
    {
      networkType: NetworkType.Mainnet,
      rpc: RPC.MAIN_HELIUS,
      rpcName: 'Helius'
    },
    {
      networkType: NetworkType.Mainnet,
      rpc: RPC.MAIN,
      rpcName: 'Eclipse'
    },
    {
      networkType: NetworkType.Mainnet,
      rpc: RPC.MAIN_LGNS,
      rpcName: 'LGNS'
    }
  ]

  const devnetRPCs: ISelectNetwork[] = [
    {
      networkType: NetworkType.Devnet,
      rpc: RPC.DEV,
      rpcName: 'Eclipse '
    },
    {
      networkType: NetworkType.Devnet,
      rpc: RPC.DEV_EU,
      rpcName: 'Eclipse EU'
    }
  ]

  const rpcs = [...testnetRPCs, ...mainnetRPCs, ...devnetRPCs]

  return (
    <Grid container>
      <Grid container className={classes.root} direction='row' alignItems='center' wrap='nowrap'>
        <Grid
          container
          item
          className={classes.leftSide}
          justifyContent='flex-start'
          sx={{ display: { xs: 'none', md: 'block' } }}>
          <CardMedia
            className={classes.logo}
            image={icons.LogoTitle}
            onClick={() => {
              if (!activePath.startsWith('exchange')) {
                navigate('/exchange')
              }
            }}
          />
        </Grid>
        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
          <Grid container item className={classes.leftSide} justifyContent='flex-start'>
            <Grid container>
              <CardMedia
                className={classes.logoShort}
                image={icons.LogoShort}
                onClick={() => {
                  if (!activePath.startsWith('exchange')) {
                    navigate('/exchange')
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>
        <Grid
          container
          item
          className={classes.routers}
          wrap='nowrap'
          sx={{
            display: { lg: 'block' },
            '@media (max-width: 1450px)': {
              display: 'none'
            }
          }}>
          {routes.map(path => (
            <Link key={`path-${path}`} to={`/${path}`} className={classes.link}>
              <NavbarButton
                name={path}
                onClick={e => {
                  if (path === 'exchange' && activePath.startsWith('exchange')) {
                    e.preventDefault()
                  }

                  setActive(path)
                }}
                active={
                  path === activePath ||
                  (!!otherRoutesToHighlight[path] &&
                    otherRoutesToHighlight[path].some(pathRegex => pathRegex.test(activePath)))
                }
              />
            </Link>
          ))}
        </Grid>

        <Grid container item className={classes.buttons} wrap='nowrap'>
          {typeOfNetwork === NetworkType.Testnet && (
            <Grid container className={classes.leftButtons}>
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <FaucetButton onFaucet={onFaucet} network={network} walletBalance={walletBalance}>
                  Faucet
                </FaucetButton>
              </Box>
            </Grid>
          )}

          <Bar
            rpcs={rpcs}
            activeNetwork={typeOfNetwork}
            activeRPC={rpc}
            onNetworkChange={onNetworkSelect}
            onChainChange={onChainSelect}
          />

          <Grid>
            <YourPointsButton />
          </Grid>

          <ChangeWalletButton
            name={
              walletConnected
                ? `${address.toString().slice(0, 4)}...${
                    !isMdDown
                      ? address
                          .toString()
                          .slice(address.toString().length - 4, address.toString().length)
                      : ''
                  }`
                : 'Connect wallet'
            }
            onConnect={onConnectWallet}
            connected={walletConnected}
            onDisconnect={onDisconnectWallet}
            startIcon={
              walletConnected ? <DotIcon className={classes.connectedWalletIcon} /> : undefined
            }
            onCopyAddress={onCopyAddress}
          />
        </Grid>

        <Grid
          sx={{
            display: {
              md: 'block',
              '@media (min-width: 1450px)': {
                display: 'none'
              }
            }
          }}>
          <IconButton
            className={classes.menuButton}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              setRoutesModalAnchor(event.currentTarget)
              setRoutesModalOpen(true)
              blurContent()
            }}>
            <CardMedia className={classes.menu} image={Hamburger} />
          </IconButton>
          <RoutesModal
            routes={routes}
            anchorEl={routesModalAnchor}
            open={routesModalOpen}
            current={activePath}
            onSelect={(selected: string) => {
              setActive(selected)
              setRoutesModalOpen(false)
              unblurContent()
            }}
            handleClose={() => {
              setRoutesModalOpen(false)
              unblurContent()
            }}
            onFaucet={isMdDown && typeOfNetwork === NetworkType.Testnet ? onFaucet : undefined}
            onSocials={
              isSmDown
                ? () => {
                    setRoutesModalOpen(false)
                    setViewSocialsOpen(true)
                  }
                : undefined
            }
          />
          <SocialModal
            open={viewSocialsOpen}
            handleClose={() => {
              setViewSocialsOpen(false)
              unblurContent()
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  )
}
export default Header
