import ChangeWalletButton from '@components/HeaderButton/ChangeWalletButton'
import FaucetButton from '@components/HeaderButton/FaucetButton'
import SelectNetworkButton from '@components/HeaderButton/SelectNetworkButton'
import SelectRPCButton from '@components/HeaderButton/SelectRPCButton'
import RoutesModal from '@components/Modals/RoutesModal/RoutesModal'
import SelectDevnetRPC from '@components/Modals/SelectDevnetRPC/SelectDevnetRPC'
import { ISelectNetwork } from '@components/Modals/SelectNetwork/SelectNetwork'
import NavbarButton from '@components/Navbar/Button'
import { EclipseNetworks, NetworkType } from '@consts/static'
import { blurContent, unblurContent } from '@consts/uiUtils'
import { CardMedia, Grid, Hidden, IconButton, useMediaQuery } from '@material-ui/core'
import DotIcon from '@material-ui/icons/FiberManualRecordRounded'
import { PublicKey } from '@solana/web3.js'
import icons from '@static/icons'
import Hamburger from '@static/svg/Hamburger.svg'
import { theme } from '@static/theme'
import classNames from 'classnames'
import React from 'react'
import { Link } from 'react-router-dom'
import useStyles from './style'

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
  defaultMainnetRPC: string
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
  onDisconnectWallet
}) => {
  const classes = useStyles()
  // const buttonClasses = useButtonStyles()

  const isXsDown = useMediaQuery(theme.breakpoints.down('xs'))

  const routes = ['swap', 'pool', 'stats', 'farms', 'token']

  const otherRoutesToHighlight: Record<string, RegExp[]> = {
    pool: [/^newPosition\/*/, /^position\/*/],
    farms: [/^farms$/, /^farm\/*/]
  }

  const [activePath, setActive] = React.useState(landing)

  const [routesModalOpen, setRoutesModalOpen] = React.useState(false)
  const [devnetRpcsOpen, setDevnetRpcsOpen] = React.useState(false)
  const [routesModalAnchor, setRoutesModalAnchor] = React.useState<HTMLButtonElement | null>(null)

  React.useEffect(() => {
    // if there will be no redirects, get rid of this
    setActive(landing)
  }, [landing])

  const devnetRPCs: ISelectNetwork[] = [
    {
      networkType: NetworkType.DEVNET,
      rpc: EclipseNetworks.DEV,
      rpcName: 'Eclipse'
    },
    {
      networkType: NetworkType.DEVNET,
      rpc: EclipseNetworks.DEV_EU,
      rpcName: 'Eclipse EU'
    }
  ]

  return (
    <Grid container>
      <Grid container className={classes.root} direction='row' alignItems='center' wrap='nowrap'>
        <Hidden smDown>
          <Grid container item className={classes.leftSide} justifyContent='flex-start'>
            <CardMedia className={classes.logo} image={icons.LogoTitle} />
          </Grid>
        </Hidden>

        <Hidden mdUp>
          <CardMedia className={classes.logoShort} image={icons.LogoShort} />
        </Hidden>

        <Hidden smDown>
          <Grid container item className={classes.routers} wrap='nowrap'>
            {routes.map(path => (
              <Link key={`path-${path}`} to={`/${path}`} className={classes.link}>
                <NavbarButton
                  name={path}
                  onClick={() => {
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
        </Hidden>

        <Grid
          container
          item
          className={classNames(
            classes.buttons,
            walletConnected ? classes.buttonsLgConnected : undefined
          )}
          wrap='nowrap'>
          <Hidden xsDown>
            {typeOfNetwork === NetworkType.DEVNET || typeOfNetwork === NetworkType.TESTNET ? (
              <FaucetButton onFaucet={onFaucet} />
            ) : null}
          </Hidden>
          <Hidden xsDown>
            {typeOfNetwork === NetworkType.DEVNET ? (
              <SelectRPCButton rpc={rpc} networks={devnetRPCs} onSelect={onNetworkSelect} />
            ) : null}
          </Hidden>
          <SelectNetworkButton
            name={typeOfNetwork}
            networks={[
              // {
              //   networkType: NetworkType.MAINNET,
              //   rpc: defaultMainnetRPC,
              //   rpcName:
              //     mainnetRPCs.find(data => data.rpc === defaultMainnetRPC)?.rpcName ?? 'Custom'
              // },
              { networkType: NetworkType.TESTNET, rpc: EclipseNetworks.TEST }
              // { networkType: NetworkType.DEVNET, rpc: EclipseNetworks.DEV_EU }
            ]}
            onSelect={onNetworkSelect}
          />
          <ChangeWalletButton
            name={
              walletConnected
                ? `${address.toString().slice(0, 8)}...${
                    !isXsDown
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
          />
        </Grid>

        <Hidden mdUp>
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
            onFaucet={
              (typeOfNetwork === NetworkType.DEVNET || typeOfNetwork === NetworkType.TESTNET) &&
              isXsDown
                ? onFaucet
                : undefined
            }
            onRPC={
              typeOfNetwork === NetworkType.MAINNET && isXsDown
                ? () => {
                    setRoutesModalOpen(false)
                    setDevnetRpcsOpen(true)
                  }
                : undefined
            }
          />
          {typeOfNetwork === NetworkType.MAINNET ? (
            <SelectDevnetRPC
              networks={devnetRPCs}
              open={devnetRpcsOpen}
              anchorEl={routesModalAnchor}
              onSelect={onNetworkSelect}
              handleClose={() => {
                setDevnetRpcsOpen(false)
                unblurContent()
              }}
              activeRPC={rpc}
            />
          ) : null}
        </Hidden>
      </Grid>
    </Grid>
  )
}
export default Header
