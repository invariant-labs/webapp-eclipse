import SelectTestnetRPC from '@components/Modals/SelectTestnetRPC/SelectTestnetRPC'
import NavbarButton from '@components/Navbar/NavbarButton'
import DotIcon from '@mui/icons-material/FiberManualRecordRounded'
import { Box, CardMedia, Grid, IconButton, useMediaQuery } from '@mui/material'
import icons from '@static/icons'
import Hamburger from '@static/svg/Hamburger.svg'
import { theme } from '@static/theme'
import { RPC, CHAINS, NetworkType } from '@store/consts/static'
import { blurContent, unblurContent } from '@utils/uiUtils'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ChangeWalletButton from './HeaderButton/ChangeWalletButton'
import SelectNetworkButton from './HeaderButton/SelectNetworkButton'
import SelectRPCButton from './HeaderButton/SelectRPCButton'
import useStyles from './style'
import SelectChainButton from './HeaderButton/SelectChainButton'
import SelectChain from '@components/Modals/SelectChain/SelectChain'
import SelectMainnetRPC from '@components/Modals/SelectMainnetRPC/SelectMainnetRPC'
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
  defaultTestnetRPC,
  onCopyAddress,
  activeChain,
  onChainSelect,
  network,
  rpcStatus,
  defaultMainnetRPC,
  walletBalance
}) => {
  const { classes } = useStyles()
  const navigate = useNavigate()

  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'))
  const showRPCBelowBreakpoint = useMediaQuery('@media (max-width:1050px)')

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
  const [RpcsModalOpen, setRpcsModalOpen] = useState(false)
  const [chainSelectOpen, setChainSelectOpen] = useState(false)
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

  const networks = useMemo(() => {
    switch (network) {
      case NetworkType.Testnet:
        return testnetRPCs
      case NetworkType.Mainnet:
        return mainnetRPCs
      case NetworkType.Devnet:
        return devnetRPCs
      default:
        return []
    }
  }, [network])

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
          <Grid container className={classes.leftButtons}>
            {typeOfNetwork === NetworkType.Testnet && (
              <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                <FaucetButton onFaucet={onFaucet} network={network} walletBalance={walletBalance}>
                  Faucet
                </FaucetButton>
              </Box>
            )}
            <Box
              sx={{
                display: { md: 'block' },
                '@media (max-width: 1050px)': {
                  display: 'none'
                }
              }}>
              <SelectRPCButton
                rpc={rpc}
                networks={networks}
                onSelect={onNetworkSelect}
                network={network}
                rpcStatus={rpcStatus}
              />
            </Box>
            <SelectNetworkButton
              name={typeOfNetwork}
              networks={[
                {
                  networkType: NetworkType.Mainnet,
                  rpc: defaultMainnetRPC,
                  rpcName:
                    mainnetRPCs.find(data => data.rpc === defaultMainnetRPC)?.rpcName ?? 'Custom'
                },
                {
                  networkType: NetworkType.Testnet,
                  rpc: defaultTestnetRPC,
                  rpcName:
                    testnetRPCs.find(data => data.rpc === defaultTestnetRPC)?.rpcName ?? 'Custom'
                }
                // {
                //   networkType: NetworkType.Devnet,
                //   rpc: defaultDevnetRPC,
                //   rpcName:
                //     mainnetRPCs.find(data => data.rpc === defaultDevnetRPC)?.rpcName ?? 'Custom'
                // }
              ]}
              onSelect={onNetworkSelect}
            />
            <Box
              sx={{
                display: {
                  md: 'block',
                  '@media (max-width: 1050px)': {
                    display: 'none'
                  }
                }
              }}>
              <SelectChainButton
                activeChain={activeChain}
                chains={CHAINS}
                onSelect={onChainSelect}
              />
            </Box>
          </Grid>

          <Bar />

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
            onRPC={
              showRPCBelowBreakpoint
                ? () => {
                    setRoutesModalOpen(false)
                    setRpcsModalOpen(true)
                  }
                : undefined
            }
            onChainSelect={
              isMdDown
                ? () => {
                    setRoutesModalOpen(false)
                    setChainSelectOpen(true)
                  }
                : undefined
            }
            onSocials={
              isSmDown
                ? () => {
                    setRoutesModalOpen(false)
                    setViewSocialsOpen(true)
                  }
                : undefined
            }
          />
          {typeOfNetwork === NetworkType.Testnet ? (
            <SelectTestnetRPC
              networks={testnetRPCs}
              open={RpcsModalOpen}
              anchorEl={routesModalAnchor}
              onSelect={onNetworkSelect}
              handleClose={() => {
                setRpcsModalOpen(false)
                unblurContent()
              }}
              activeRPC={rpc}
              rpcStatus={rpcStatus}
            />
          ) : (
            <SelectMainnetRPC
              networks={mainnetRPCs}
              open={RpcsModalOpen}
              anchorEl={routesModalAnchor}
              onSelect={onNetworkSelect}
              handleClose={() => {
                setRpcsModalOpen(false)
                unblurContent()
              }}
              activeRPC={rpc}
              rpcStatus={rpcStatus}
            />
          )}
          <SelectChain
            chains={CHAINS}
            open={chainSelectOpen}
            anchorEl={routesModalAnchor}
            onSelect={onChainSelect}
            handleClose={() => {
              setChainSelectOpen(false)
              unblurContent()
            }}
            activeChain={activeChain}
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
