// import { Grid, Box, Typography, Grow, useMediaQuery, Hidden } from '@mui/material'
// import { useStyles } from './styles'
// import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
// import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
// import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
// import { useDispatch, useSelector } from 'react-redux'
// import { actions, NFTStatus } from '@store/reducers/sale'
// import { actions as walletActions } from '@store/reducers/solanaWallet'
// import { /*isLoadingProof,*/ proofOfInclusion, saleSelectors } from '@store/selectors/sale'
// import { BN } from '@coral-xyz/anchor'
// import { PublicKey } from '@solana/web3.js'
// import { printBNandTrimZeros } from '@utils/utils'
// import NftPlaceholder from '@static/png/presale/NFT_Card.png'
// import {
//   EFFECTIVE_TARGET,
//   getRound,
//   getTierPrices,
//   getCurrentTierLimit,
//   PERCENTAGE_DENOMINATOR,
//   TIER1,
//   TIER2,
//   TIER3,
//   TIER4,
//   MIN_DEPOSIT_FOR_NFT_MINT
// } from '@invariant-labs/sale-sdk'
// import { balanceLoading, status, poolTokens, balance } from '@store/selectors/solanaWallet'
// import {
//   getAmountTillNextPriceIncrease,
//   getPrice,
//   getTimestampSeconds
// } from '@invariant-labs/sale-sdk/lib/utils'
// import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
// import { colors, theme } from '@static/theme'
// import { Faq } from '@common/Faq/Faq'
// import { PreSaleCard } from '@components/PreSale/PreSaleCard/PreSaleCard'
// import SolanaHackatonHero from '@static/png/presale/cards/SolanaHackaton.png'
// import SolanaMainNetHero from '@static/png/presale/cards/SolanaLaunch.png'
// import AlphHackatonHero from '@static/png/presale/cards/AlphHackaton.png'
// import EclipseHackatonHero from '@static/png/presale/cards/EclipseHackaton.png'
// import EclipseMainNetHero from '@static/png/presale/cards/EclipseLaunch.png'
// import TVLHero from '@static/png/presale/cards/TVL.png'
// import UsersHero from '@static/png/presale/cards/Users.png'
// import SonicHacktonHero from '@static/png/presale/cards/SonicHackaton.png'
// import AutoswapHero from '@static/png/presale/cards/Autoswap.png'

// import { EventsCard } from '@components/PreSale/EventsCards/EventsCard'
// import Slider from 'react-slick'
// import 'slick-carousel/slick/slick.css'
// import 'slick-carousel/slick/slick-theme.css'
// import ArrowLeft from '@static/png/presale/arrow_left.png'
// import ArrowRight from '@static/png/presale/arrow_right.png'
// import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
// import { OverlayWrapper } from '@components/PreSale/Overlay/Overlay'
// import { auditByLogoIcon, swapArrowClean } from '@static/icons'
// import { Tokenomics } from '@components/PreSale/Tokenomics/Tokenomics'
// import { DEXChart } from '@components/PreSale/DEXChart/DEXChart'
// import { getCurrentSolanaConnection } from '@utils/web3/connection'
// import { Button } from '@common/Button/Button'
// import { ShareComponent } from '@components/PreSale/ShareComponent/ShareComponent'
// import { blurContent, unblurContent } from '@utils/uiUtils'
// import { actions as snackbarsActions } from '@store/reducers/snackbars'
// import { ShareIcon } from '@static/componentIcon/ShareIcon'
// import { Timer } from '@components/PreSale/Timer/Timer'
// import { useCountdown } from '@components/PreSale/Timer/useCountdown'

// function SampleNextArrow(props) {
//   const { className, style, onClick } = props
//   return (
//     <div
//       className={className}
//       style={{
//         ...style,
//         display: 'block',

//         backgroundImage: `url(${ArrowRight})`,
//         backgroundSize: 'cover',
//         zIndex: 3
//       }}
//       onClick={onClick}
//     />
//   )
// }

// function SamplePrevArrow(props) {
//   const { className, style, onClick } = props
//   return (
//     <div
//       className={className}
//       style={{
//         ...style,
//         display: 'block',
//         backgroundImage: `url(${ArrowLeft})`,
//         backgroundSize: 'cover',
//         zIndex: 3
//       }}
//       onClick={onClick}
//     />
//   )
// }

// const useIntersectionObserver = (options = {}) => {
//   const [isVisible, setIsVisible] = useState(false)
//   const ref = useRef(null)

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) {
//         setIsVisible(true)
//         if (ref.current) observer.unobserve(ref.current)
//       }
//     }, options)

//     if (ref.current) {
//       observer.observe(ref.current)
//     }

//     return () => {
//       if (ref.current) observer.unobserve(ref.current)
//     }
//   }, [ref, options])

//   return { ref, isVisible }
// }

// const AnimatedPreSaleCard = ({
//   title,
//   subtitle,
//   gradientPrimaryColor,
//   gradientDirection = 'to top',
//   delay
// }: {
//   title: string
//   imageSize?: { width: number; height: number }
//   subtitle: string
//   imageSrc?: string
//   gradientDirection?: 'to right' | 'to left' | 'to top' | 'to bottom'
//   gradientPrimaryColor?: string
//   imageDirection?: 'left' | 'right'
//   delay: number
// }) => {
//   const { ref: cardRef, isVisible: isCardVisible } = useIntersectionObserver({
//     threshold: 0.1,
//     rootMargin: '0px 0px -50px 0px'
//   })

//   const [visible, setVisible] = useState(false)

//   useEffect(() => {
//     let timer
//     if (isCardVisible) {
//       timer = setTimeout(() => {
//         setVisible(true)
//       }, delay)
//     }

//     return () => clearTimeout(timer)
//   }, [isCardVisible, delay])

//   return (
//     <div ref={cardRef} style={{ width: '100%' }}>
//       <Grow
//         in={visible}
//         style={{ transformOrigin: '0 0 0' }}
//         timeout={{
//           enter: 1000
//         }}>
//         <Box
//           sx={{
//             transform: visible ? 'translateY(0)' : 'translateY(50px)',
//             transition: 'transform 0.8s ease-out',
//             opacity: visible ? 1 : 0
//           }}>
//           <PreSaleCard
//             title={title}
//             subtitle={subtitle}
//             gradientDirection={gradientDirection}
//             gradientPrimaryColor={gradientPrimaryColor}
//           />
//         </Box>
//       </Grow>
//     </div>
//   )
// }

// export const PreSaleWrapper = () => {
//   const { classes, cx } = useStyles()
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'))
//   const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))
//   const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
//   const connection = getCurrentSolanaConnection()
//   const dispatch = useDispatch()
//   const isLoadingSaleStats = useSelector(saleSelectors.isLoadingSaleStats)
//   const isLoadingUserStats = useSelector(saleSelectors.isLoadingUserStats)
//   // const isLoadingProofOfInclusion = useSelector(isLoadingProof)
//   const saleStats = useSelector(saleSelectors.saleStats)
//   const userStats = useSelector(saleSelectors.userStats)
//   const { success, inProgress } = useSelector(saleSelectors.deposit)
//   const tokens = useSelector(poolTokens)
//   const nativeBalance = useSelector(balance)
//   const walletStatus = useSelector(status)
//   const isBalanceLoading = useSelector(balanceLoading)
//   const proof = useSelector(proofOfInclusion)
//   const [progress, setProgress] = useState<ProgressState>('none')
//   const [tokenIndex, setTokenIndex] = useState<number | null>(null)
//   const [currentTimestamp, setCurrentTimestamp] = useState<BN>(getTimestampSeconds())
//   const initialReversePrices = localStorage.getItem('INVARIANT_SALE_REVERSE_PRICES') === 'true'
//   const [reversedPrices, setReversedPrices] = useState(initialReversePrices)
//   // const walletAddress = useSelector(address)
//   const hasMintedNft = useMemo(() => {
//     const depositedAboveThreshold = userStats?.deposited.gte(MIN_DEPOSIT_FOR_NFT_MINT)
//     return depositedAboveThreshold && !userStats?.canMintNft
//   }, [userStats])

//   const nftStatus = useMemo<NFTStatus>(() => {
//     if (!userStats) {
//       return NFTStatus.NonEligible
//     }

//     if (userStats.canMintNft) {
//       return NFTStatus.Eligible
//     }

//     if (userStats.deposited.gte(MIN_DEPOSIT_FOR_NFT_MINT) && !userStats.canMintNft) {
//       return NFTStatus.Claimed
//     }

//     return NFTStatus.NonEligible
//   }, [userStats?.canMintNft, hasMintedNft])

//   const slidesToShow = useMemo(() => {
//     if (isSmallMobile) return 1
//     if (isMobile) return 1
//     if (isTablet) return 2
//     return 3
//   }, [isMobile, isTablet, isSmallMobile])

//   const togglePriceDirection = useCallback(() => {
//     setReversedPrices(prev => {
//       const next = !prev
//       localStorage.setItem('INVARIANT_SALE_REVERSE_PRICES', String(next))
//       return next
//     })
//   }, [])

//   const {
//     targetAmount,
//     currentAmount,
//     whitelistWalletLimit,
//     startTimestamp,
//     // duration,
//     mint,
//     minDeposit
//   } = useMemo(
//     () =>
//       saleStats
//         ? saleStats
//         : {
//             targetAmount: new BN(0),
//             currentAmount: new BN(0),
//             whitelistWalletLimit: new BN(0),
//             startTimestamp: new BN(0),
//             duration: new BN(0),
//             mint: new PublicKey(0),
//             minDeposit: new BN(0)
//           },
//     [saleStats]
//   )

//   useEffect(() => {
//     const index = tokens.findIndex(token => token.assetAddress.equals(mint))
//     if (index !== -1) setTokenIndex(index)
//   }, [tokens, mint])

//   const { deposited, received } = useMemo(
//     () =>
//       userStats
//         ? userStats
//         : {
//             deposited: new BN(0),
//             received: new BN(0)
//           },
//     [userStats]
//   )

//   const round = useMemo(() => getRound(currentAmount, targetAmount), [currentAmount, targetAmount])

//   const remainingAmount = useMemo(
//     () => (!whitelistWalletLimit.isZero() ? whitelistWalletLimit.sub(deposited) : new BN(0)),
//     [deposited, whitelistWalletLimit]
//   )

//   const amountNeeded = useMemo(() => {
//     if (targetAmount.isZero()) return new BN(0)
//     if (round === 4) return EFFECTIVE_TARGET
//     return getCurrentTierLimit(currentAmount, targetAmount)
//   }, [currentAmount, targetAmount])

//   const filledPercentage = useMemo(() => {
//     if (targetAmount.isZero()) return new BN(0)
//     if (round === 4)
//       return currentAmount.muln(100).mul(PERCENTAGE_DENOMINATOR).div(EFFECTIVE_TARGET)
//     return !amountNeeded.isZero()
//       ? currentAmount.muln(100).mul(PERCENTAGE_DENOMINATOR).div(amountNeeded)
//       : new BN(0)
//   }, [currentAmount, amountNeeded, round])

//   const amountLeft = useMemo(() => {
//     if (targetAmount.isZero()) return new BN(0)
//     if (round === 4) return EFFECTIVE_TARGET.sub(currentAmount)
//     if (round == 1) {
//       return new BN(150_000_000_000).sub(currentAmount) // 150k USDC
//     }
//     if (round == 2) {
//       return new BN(300_000_000_000).sub(currentAmount) // 300k USDC
//     }
//     return getAmountTillNextPriceIncrease(currentAmount, targetAmount)
//   }, [currentAmount, targetAmount])

//   const mintDecimals = useMemo(
//     () => (tokenIndex !== null ? tokens[tokenIndex].decimals : 0),
//     [tokenIndex, tokens]
//   )

//   const tierPrices = useMemo(() => getTierPrices(mintDecimals), [mintDecimals])

//   const { price, nextPrice } = useMemo(
//     () => getPrice(currentAmount, targetAmount, mintDecimals),
//     [currentAmount, targetAmount, mintDecimals]
//   )

//   const endtimestamp = useMemo(() => new BN(1752840000), [])
//   const saleSoldOut = useMemo(
//     () => currentAmount.eq(EFFECTIVE_TARGET),
//     [targetAmount, currentAmount]
//   )

//   const saleEnded = useMemo(() => {
//     return currentTimestamp.gt(endtimestamp)
//   }, [endtimestamp, currentTimestamp])

//   const saleDidNotStart = useMemo(() => {
//     return currentTimestamp.lt(startTimestamp)
//   }, [startTimestamp, currentTimestamp])

//   const isActive = useMemo(() => {
//     return !saleDidNotStart && !saleEnded && !saleSoldOut
//   }, [saleDidNotStart, saleEnded, saleSoldOut])

//   const isPublic = useMemo(() => round === 4, [round])

//   // useEffect(() => {
//   //   if (
//   //     walletStatus === Status.Initialized &&
//   //     walletAddress &&
//   //     !walletAddress.equals(DEFAULT_PUBLICKEY)
//   //   ) {
//   //     dispatch(actions.getProof())
//   //   }
//   // }, [walletStatus, isPublic, walletAddress])

//   const isLimitExceed = useMemo(
//     () => deposited.gte(whitelistWalletLimit) && !isPublic,
//     [round, deposited, connection]
//   )

//   const getAlertBoxText = useCallback(() => {
//     if (isLimitExceed) {
//       return {
//         text: 'Allocation limit reached',
//         variant: 'limit'
//       }
//     }
//     if (!isPublic) {
//       return { text: 'Sale is in public phase' }
//     }
//     if (isPublic) {
//       return { text: 'Sale is in public phase' }
//     }
//     if (!isActive) {
//       return { text: 'Sale not active' }
//     }
//   }, [isPublic, isLimitExceed])

//   useEffect(() => {
//     dispatch(actions.getUserStats())
//   }, [dispatch])

//   useEffect(() => {
//     const intervalId = setInterval(() => setCurrentTimestamp(getTimestampSeconds()), 1000)
//     return () => {
//       clearInterval(intervalId)
//     }
//   }, [])

//   useEffect(() => {
//     let timeoutId1: NodeJS.Timeout
//     let timeoutId2: NodeJS.Timeout

//     if (!inProgress && progress === 'progress') {
//       setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

//       timeoutId1 = setTimeout(() => {
//         setProgress(success ? 'success' : 'failed')
//       }, 500)

//       timeoutId2 = setTimeout(() => {
//         setProgress('none')
//         dispatch(actions.setDepositSuccess(false))
//       }, 1800)
//     }

//     return () => {
//       clearTimeout(timeoutId1)
//       clearTimeout(timeoutId2)
//     }
//   }, [success, inProgress])

//   const displayPriceInfo = useMemo(() => {
//     if (reversedPrices) {
//       const tierIndex = round - 1
//       const currentTierPrice =
//         tierIndex >= 0 ? [TIER1, TIER2, TIER3, TIER4][Math.min(tierIndex, 3)] : price
//       const nextTierPrice =
//         tierIndex > 0 ? [TIER1, TIER2, TIER3, TIER4][Math.min(tierIndex + 1, 3)] : nextPrice
//       return {
//         currentPrice: currentTierPrice,
//         nextPrice: nextTierPrice
//       }
//     }

//     return {
//       currentPrice: price,
//       nextPrice: nextPrice
//     }
//   }, [price, nextPrice, round, reversedPrices])

//   const stepNames = ['Early Bird', 'Phase 2', 'Phase 3', 'Open Phase']

//   const stepLabels = useMemo(() => {
//     return tierPrices.map((price, idx) => {
//       if (reversedPrices && !price.isZero()) {
//         const baseValue = new BN(10).pow(new BN(mintDecimals))
//         const inverted = baseValue.mul(baseValue).div(price)
//         return {
//           id: idx + 1,
//           label: `1$ = ${printBNandTrimZeros(inverted, mintDecimals, 2)} INVT`,
//           name: stepNames[idx]
//         }
//       } else {
//         return {
//           id: idx + 1,
//           label: `1 INVT = ${printBNandTrimZeros(price, mintDecimals, 4)}$`,
//           name: stepNames[idx]
//         }
//       }
//     })
//   }, [tierPrices, reversedPrices, mintDecimals])

//   const [isShareComponentShown, setIsShareComponentShown] = useState(false)

//   useEffect(() => {
//     if (progress === 'success') {
//       setIsShareComponentShown(true)
//     }
//   }, [progress])

//   useEffect(() => {
//     if (isShareComponentShown) {
//       blurContent()
//     } else {
//       unblurContent()
//     }
//   }, [isShareComponentShown])

//   const addDownloadSnackbar = () => {
//     dispatch(
//       snackbarsActions.add({
//         message: 'Successfully downloaded',
//         variant: 'success',
//         persist: false
//       })
//     )
//   }

//   const addCopySnackbar = () => {
//     dispatch(
//       snackbarsActions.add({
//         message: 'Successfully copied to clipboard',
//         variant: 'success',
//         persist: false
//       })
//     )
//   }

//   const roundName = useMemo(() => {
//     return stepNames[round - 1]
//   }, [round])

//   const timerTargetDate = useMemo(() => new Date(endtimestamp.toNumber() * 1000), [endtimestamp])
//   const { hours, minutes, seconds } = useCountdown({
//     targetDate: timerTargetDate
//   })

//   return (
//     <Grid className={classes.pageWrapper} sx={{ position: 'relative' }}>
//       <Hidden lgDown>
//         <OverlayWrapper />
//       </Hidden>

//       <ShareComponent
//         open={isShareComponentShown}
//         allocation={received}
//         mintDecimals={mintDecimals}
//         onClose={() => setIsShareComponentShown(false)}
//         addDownloadSnackbar={addDownloadSnackbar}
//         addCopySnackbar={addCopySnackbar}
//       />

//       <Box className={classes.contentWrapper}>
//         <Grid className={classes.stepperContainer}>
//           <Box display='flex' flexDirection='column' width={isTablet ? '100%' : 'auto'}>
//             {!saleEnded && (
//               <>
//                 <SaleStepper
//                   isLoading={isLoadingSaleStats}
//                   currentStep={round - 1}
//                   steps={stepLabels}
//                 />
//                 <Box className={classes.timerContainer}>
//                   <Typography className={classes.endSaleTitle}>Sale ends in:</Typography>
//                   <Timer hours={hours} minutes={minutes} seconds={seconds} isSmall />
//                 </Box>
//               </>
//             )}
//           </Box>
//           <Box className={classes.roundComponentContainer}>
//             <RoundComponent
//               isActive={isActive}
//               saleDidNotStart={saleDidNotStart}
//               saleEnded={saleEnded}
//               saleSoldOut={saleSoldOut}
//               targetAmount={targetAmount}
//               amountDeposited={currentAmount}
//               amountNeeded={amountNeeded}
//               amountLeft={amountLeft}
//               currentPrice={displayPriceInfo.currentPrice}
//               walletStatus={walletStatus}
//               nextPrice={displayPriceInfo.nextPrice}
//               proofOfInclusion={proof}
//               percentageFilled={filledPercentage}
//               userDepositedAmount={deposited}
//               userReceivededAmount={received}
//               userRemainingAllocation={remainingAmount}
//               isReversed={reversedPrices}
//               mintDecimals={mintDecimals}
//               roundNumber={round}
//               isLoadingSaleStats={isLoadingSaleStats}
//               isLoadingUserStats={isLoadingUserStats}
//               priceFormat={reversedPrices ? 'usdc-to-token' : 'token-to-usdc'}
//               roundName={roundName}
//             />
//             <Box className={classes.shareButtonContainer}>
//               <Button
//                 width='100%'
//                 scheme='green'
//                 onClick={() => setIsShareComponentShown(true)}
//                 disabled={received.eqn(0)}>
//                 <div className={classes.shareContainer}>
//                   Share{' '}
//                   <ShareIcon
//                     color={received.eqn(0) ? colors.invariant.textGrey : colors.invariant.black}
//                   />
//                 </div>
//               </Button>
//             </Box>
//             <Grid className={classes.reverseContainer}>
//               <div className={classes.arrowIcon} onClick={togglePriceDirection}>
//                 <span className={`${classes.reverseText} reverseText`}>Reverse token ratio</span>
//                 <img src={swapArrowClean} alt='swap' />
//               </div>
//             </Grid>
//           </Box>
//         </Grid>
//         <BuyComponent
//           minDeposit={minDeposit}
//           nativeBalance={nativeBalance}
//           isPublic={isPublic}
//           currentRound={round}
//           saleDidNotStart={saleDidNotStart}
//           saleEnded={saleEnded}
//           saleSoldOut={saleSoldOut}
//           isEligible={true}
//           whitelistWalletLimit={whitelistWalletLimit}
//           userDepositedAmount={deposited}
//           isActive={isActive}
//           progress={progress}
//           isLoading={isLoadingSaleStats}
//           targetAmount={round === 4 ? EFFECTIVE_TARGET : targetAmount}
//           currentAmount={currentAmount}
//           mintDecimals={mintDecimals}
//           startTimestamp={startTimestamp}
//           tokens={tokens}
//           walletStatus={walletStatus}
//           alertBox={getAlertBoxText()}
//           isBalanceLoading={isBalanceLoading}
//           isLoadingUserStats={isLoadingUserStats}
//           tokenIndex={tokenIndex}
//           onConnectWallet={() => {
//             dispatch(walletActions.connect(false))
//           }}
//           onDisconnectWallet={() => {
//             dispatch(walletActions.disconnect())
//           }}
//           onBuyClick={amount => {
//             if (tokenIndex === null) {
//               return
//             }
//             if (progress === 'none') {
//               setProgress('progress')
//             }
//             dispatch(
//               actions.depositSale({
//                 amount,
//                 mint
//                 // proofOfInclusion: proof
//               })
//             )
//           }}
//         />
//       </Box>
//       <Box className={classes.sectionTitle}>
//         <Typography className={classes.sectionTitleText}>Proof of Contribution</Typography>
//         <Box display='flex' alignItems='center' gap={12} className={classes.nftBackground}>
//           <Box className={classes.nftWrapper}>
//             <Typography component='section'>
//               Every participant in the Invariant Sale who contributes at least $
//               {printBNandTrimZeros(MIN_DEPOSIT_FOR_NFT_MINT, 6)} will be able to mint a special,
//               non-transferable NFT. This NFT is not intended for trading or circulation. Instead, it
//               serves as an on-chain marker that links the wallet to future benefits and privileges
//               as part of our long-term roadmap
//             </Typography>
//             <Typography component='h4'>Status</Typography>
//             <Typography component='h1'>{nftStatus}</Typography>

//             <Button
//               scheme='green'
//               onClick={() => dispatch(actions.mintNft())}
//               width={185}
//               height={44}
//               disabled={!userStats?.canMintNft}>
//               Mint
//             </Button>
//           </Box>
//           <Box className={classes.nftCardWrapper}>
//             <img className={classes.nftCard} src={NftPlaceholder} />
//             <Typography className={classes.nftText}>Invariant Contributor NFT</Typography>
//           </Box>
//         </Box>
//       </Box>
//       <Box className={classes.sectionTitle}>
//         <Typography className={classes.sectionTitleText}>Core Metrics</Typography>
//         <Grid container className={classes.animatedCardsContainer}>
//           <Grid item className={classes.animatedCardItem}>
//             <AnimatedPreSaleCard
//               title='~1M Users'
//               gradientPrimaryColor={`${colors.invariant.green}`}
//               subtitle='who have ever interacted with Invariant (Solana + Eclipse)'
//               delay={100}
//             />
//           </Grid>
//           <Grid item className={classes.animatedCardItem}>
//             <AnimatedPreSaleCard
//               title='~$5 Billion'
//               gradientDirection='to bottom'
//               subtitle='in cumulative swap volume'
//               delay={300}
//             />
//           </Grid>
//           <Grid item className={cx(classes.animatedCardItem, classes.animatedCardItemWide)}>
//             <AnimatedPreSaleCard
//               gradientPrimaryColor={colors.invariant.component}
//               title='$4.5 MLN'
//               subtitle='Fully Diluted Valuation (FDV)'
//               delay={400}
//             />
//           </Grid>
//           <Grid item className={classes.animatedCardItem}>
//             <AnimatedPreSaleCard
//               title='4 Hackathons'
//               subtitle='won by Invariant team ($200k in prizes)'
//               delay={500}
//             />
//           </Grid>
//           <Grid item className={classes.animatedCardItem}>
//             <AnimatedPreSaleCard
//               title='$1M in Fees'
//               gradientPrimaryColor={`${colors.invariant.green}`}
//               gradientDirection='to bottom'
//               subtitle='generated for liquidity providers'
//               delay={700}
//             />
//           </Grid>
//         </Grid>
//       </Box>
//       <Box className={classes.sectionTitle}>
//         <Typography className={classes.sectionTitleText}>Designed for efficiency</Typography>
//         <Box className={classes.dexChartContainer}>
//           <DEXChart />
//         </Box>
//       </Box>
//       <Box className={classes.sectionTitle}>
//         <Typography className={classes.sectionTitleText}>Invariant's Journey</Typography>
//         <Box className={classes.cardsContainer}>
//           <Slider
//             speed={500}
//             slidesToShow={slidesToShow}
//             slidesToScroll={1}
//             arrows={true}
//             draggable={true}
//             dotsClass={`slick-dots ${classes.dots}`}
//             dots={isSmallMobile}
//             appendDots={dots => <ul>{dots}</ul>}
//             className={classes.slider}
//             autoplay={true}
//             autoplaySpeed={10000}
//             nextArrow={isSmallMobile ? null : <SampleNextArrow />}
//             prevArrow={isSmallMobile ? null : <SamplePrevArrow />}
//             rows={1}>
//             <EventsCard
//               title={'Solana Riptide Hackathon'}
//               description={
//                 'First win comes at a major hackathon. Invariant celebrates its first big success.'
//               }
//               heroImage={SolanaHackatonHero}
//             />
//             <EventsCard
//               title={'Solana Mainnet Launch'}
//               borderColor='green'
//               link='https://medium.com/@invariant_labs/what-is-invariant-introduction-351b17296136'
//               description={
//                 'Invariant says hello to the world. The first transaction on Solana Mainnet is now complete.'
//               }
//               heroImage={SolanaMainNetHero}
//             />
//             <EventsCard
//               title={'Alephium Hackathon'}
//               link='https://medium.com/@alephium/hackathon-winners-announced-68d55711b99d'
//               description={
//                 'Second hackathon win on Alephium. Invariant secures $15k and proves its skills once again.'
//               }
//               heroImage={AlphHackatonHero}
//             />
//             <EventsCard
//               title={'Eclipse Hackathon'}
//               link='https://x.com/invariant_labs/status/1839676182884663721'
//               description={`Third time's the charm. Invariant wins the opening hackathon on Eclipse, earns $15k, and steps into the spotlight.`}
//               heroImage={EclipseHackatonHero}
//             />
//             <EventsCard
//               title={'Eclipse Mainnet Launch'}
//               link='https://x.com/invariant_labs/status/1849106452259991654'
//               borderColor={'pink'}
//               description={
//                 'Invariant expands to new SVMs. After being the first app on Eclipse testnet and tested by thousands, Invariant launches on mainnet.'
//               }
//               heroImage={EclipseMainNetHero}
//             />
//             <EventsCard
//               title={'$8MLN TVL'}
//               link='https://x.com/invariant_labs/status/1890092960815149087'
//               borderColor={'green'}
//               description={'In just four months, TVL on Eclipse surpasses 8 million dollars.'}
//               heroImage={TVLHero}
//             />
//             <EventsCard
//               title={'250k+ users on Eclipse'}
//               link='https://x.com/invariant_labs/status/1912589859811913986'
//               description={
//                 'After six months on Eclipse mainnet, Invariant surpasses a massive milestone of 250,000 users.'
//               }
//               heroImage={UsersHero}
//             />
//             <EventsCard
//               title={'Sonic Mobius Hackathon'}
//               link='https://x.com/SonicSVM/status/1910590750024147382'
//               borderColor={'green'}
//               description={
//                 'Invariant wins the Sonic hackathon with its breakthrough AutoSwap feature. A new era of liquidity provision begins.'
//               }
//               heroImage={SonicHacktonHero}
//             />
//             <EventsCard
//               title={'AutoSwap Launch'}
//               link='https://x.com/invariant_labs/status/1912894700614271377'
//               description={
//                 'AutoSwap launches on Eclipse. In its first week, it improves the experience for countless users who create thousands of positions with its help.'
//               }
//               heroImage={AutoswapHero}
//             />
//             <EventsCard
//               title={'Launch of sBITZ'}
//               borderColor={'pink'}
//               description={
//                 'Invariant introduces Liquid Staking on Eclipse. The sBITZ token is launched to solve BITZ liquidity issues and offer users significantly higher yields.'
//               }
//               heroImage={'https://eclipse.invariant.app/sBitz.png'}
//             />
//           </Slider>
//         </Box>
//       </Box>
//       <Box className={classes.sectionTokenomics}>
//         <Typography className={classes.sectionTitleText}>Tokenomics</Typography>
//         <Tokenomics />
//       </Box>
//       <Box className={classes.sectionTitle}>
//         <Typography className={classes.sectionTitleText}>Audited By</Typography>
//         <img src={auditByLogoIcon} alt='Audit' width={289} />
//       </Box>
//       <Box className={classes.sectionTitle}>
//         <Typography className={classes.sectionTitleText}>Frequently Asked Questions</Typography>
//         <Faq
//           faqData={[
//             {
//               question: '1. How does the Progressive Price Model work?',
//               answer: `
//       The model is designed to reward early contributors. The earlier you participate, the better price you get for the tokens.<br/><br/>
//       The sale is divided into 4 phases, each with its own target. Once a phase's target is reached, the sale moves to the next phase and the price permanently increases.<br/><br/>
//       <b>Phases:</b><br/>
//       1. Early Bird (0 - $150k) <span style="color: #2EE09A; font-weight: bold;">$0.010</span><br/>
//       2. Phase 2 ($150k - $300k) <span style="color: #2EE09A; font-weight: bold;">$0.013</span><br/>
//       3. Phase 3 ($300k - $450k) <span style="color: #2EE09A; font-weight: bold;">$0.015</span><br/>
//       4. Open Phase (+$450k) <span style="color: #2EE09A; font-weight: bold;">$0.017</span>
//     `
//             },
//             {
//               question: '2. Is the purchasable amount per wallet for one phase or the whole sale?',
//               answer: `The max allocation (<span style="color: #2EE09A; font-weight: bold;">$4.5k</span>) is shared across the first three phases, and you can split it however you want between them.<br/>
//                  For the final phase, only the global target applies—participate early as tokens are available on a first-come, first-served basis until the target is reached.
//                  `
//             },
//             {
//               question: '3. Is USDC the only accepted currency during the presale?',
//               answer:
//                 'Yes, <span style="color: #2EE09A; font-weight: bold;">USDC</span> is the only supported payment option.'
//             },
//             {
//               question: '4. Who is whitelisted?',
//               answer:
//                 'Only wallets of users who have actively supported the development of Eclipse and Invariant.'
//             },
//             {
//               question: '5. How can I tell if I am whitelisted?',
//               answer:
//                 'You can use the <span style="color: #2EE09A; font-weight: bold;">Whitelist Checker</span> located at the top of the page.'
//             },
//             {
//               question: '6. I am not whitelisted, can I still take part in the Community Sale?',
//               answer:
//                 'Yes, you can participate in the <span style="color: #2EE09A; font-weight: bold;">Open Phase (Phase 4)</span> or  <span style="color: #2EE09A; font-weight: bold;">8 hours before the end of the sale.</span>'
//             },
//             {
//               question: '7. When can I claim tokens? When is TGE?',
//               answer: `
//       You will be able to claim your tokens during the <span style="color: #2EE09A; font-weight: bold;">TGE (Token Generation Event)</span>, which will take place shortly after the Community Sale ends.</br>
//       We will announce the exact date on our social media.
//     `
//             },
//             {
//               question: '8. Why spend $450 to get the NFT?',
//               answer: `
//       The <span style="color: #2EE09A; font-weight: bold;">$450</span> spending milestone unlocks an exclusive NFT as a reward alongside your <span style="color: #2EE09A; font-weight: bold;">INVT</span> tokens. It's our way of recognizing significant contributors to the Invariant Community Sale.<br/><br/>
//       Supply is limited to a few hundred pieces depending on the sale outcome.
//     `
//             },
//             {
//               question: '9. What does holding the NFT give you?',
//               answer: `
//       The NFT serves as an on-chain marker linking your wallet to future benefits and privileges in our long-term roadmap. It is non-transferable and not intended for trading.
//     `
//             },
//             {
//               question: '10. Can I sell or transfer my NFT?',
//               answer:
//                 'No, the NFT is non-transferable and tied exclusively to the wallet that participated in the Community Sale.'
//             }
//           ]}
//         />
//       </Box>
//     </Grid>
//   )
// }
