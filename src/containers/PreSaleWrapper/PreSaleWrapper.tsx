import { Grid, Box, Typography, Grow, useMediaQuery, Hidden } from '@mui/material'
import { useStyles } from './styles'
import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/sale'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { proofOfInclusion, saleSelectors } from '@store/selectors/sale'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { printBNandTrimZeros } from '@utils/utils'
import {
  EFFECTIVE_TARGET_MULTIPLIER,
  getRound,
  getTierPrices,
  getCurrentTierLimit,
  PERCENTAGE_DENOMINATOR,
  TIER1,
  TIER2,
  TIER3,
  TIER4
} from '@invariant-labs/sale-sdk'
import { balanceLoading, status, poolTokens, balance } from '@store/selectors/solanaWallet'
import {
  getAmountTillNextPriceIncrease,
  getPrice,
  getTimestampSeconds
} from '@invariant-labs/sale-sdk/lib/utils'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'
import { colors, theme } from '@static/theme'
import { Faq } from '@common/Faq/Faq'
import { PreSaleCard } from '@components/PreSale/PreSaleCard/PreSaleCard'
import SolanaHackatonHero from '@static/png/presale/cards/SolanaHackaton.png'
import SolanaMainNetHero from '@static/png/presale/cards/SolanaLaunch.png'
import AlphHackatonHero from '@static/png/presale/cards/AlphHackaton.png'
import EclipseHackatonHero from '@static/png/presale/cards/EclipseHackaton.png'
import EclipseMainNetHero from '@static/png/presale/cards/EclipseLaunch.png'
import TVLHero from '@static/png/presale/cards/TVL.png'
import UsersHero from '@static/png/presale/cards/Users.png'
import SonicHacktonHero from '@static/png/presale/cards/SonicHackaton.png'
import AutoswapHero from '@static/png/presale/cards/Autoswap.png'
import PubliSaleHero from '@static/png/presale/cards/SaleBegins.png'

import { EventsCard } from '@components/PreSale/EventsCards/EventsCard'
import Slider from 'react-slick'
import 'slick-carousel/slick/slick.css'
import 'slick-carousel/slick/slick-theme.css'
import ArrowLeft from '@static/png/presale/arrow_left.png'
import ArrowRight from '@static/png/presale/arrow_right.png'
import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { OverlayWrapper } from '@components/PreSale/Overlay/Overlay'
import { getEclipseWallet } from '@utils/web3/wallet'
import { DEFAULT_PUBLICKEY } from '@store/consts/static'
import { auditByLogoIcon, swapArrowClean } from '@static/icons'
import { Tokenomics } from '@components/PreSale/Tokenomics/Tokenomics'
import { DEXChart } from '@components/PreSale/DEXChart/DEXChart'
import { getCurrentSolanaConnection } from '@utils/web3/connection'

function SampleNextArrow(props) {
  const { className, style, onClick } = props
  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'block',

        backgroundImage: `url(${ArrowRight})`,
        backgroundSize: 'cover',
        zIndex: 3
      }}
      onClick={onClick}
    />
  )
}

function SamplePrevArrow(props) {
  const { className, style, onClick } = props
  return (
    <div
      className={className}
      style={{
        ...style,
        display: 'block',
        backgroundImage: `url(${ArrowLeft})`,
        backgroundSize: 'cover',
        zIndex: 3
      }}
      onClick={onClick}
    />
  )
}

const useIntersectionObserver = (options = {}) => {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true)
        if (ref.current) observer.unobserve(ref.current)
      }
    }, options)

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) observer.unobserve(ref.current)
    }
  }, [ref, options])

  return { ref, isVisible }
}

const AnimatedPreSaleCard = ({
  title,
  subtitle,
  gradientPrimaryColor,
  gradientDirection = 'to top',
  delay
}: {
  title: string
  imageSize?: { width: number; height: number }
  subtitle: string
  imageSrc?: string
  gradientDirection?: 'to right' | 'to left' | 'to top' | 'to bottom'
  gradientPrimaryColor?: string
  imageDirection?: 'left' | 'right'
  delay: number
}) => {
  const { ref: cardRef, isVisible: isCardVisible } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer
    if (isCardVisible) {
      timer = setTimeout(() => {
        setVisible(true)
      }, delay)
    }

    return () => clearTimeout(timer)
  }, [isCardVisible, delay])

  return (
    <div ref={cardRef} style={{ width: '100%' }}>
      <Grow
        in={visible}
        style={{ transformOrigin: '0 0 0' }}
        timeout={{
          enter: 1000
        }}>
        <Box
          sx={{
            transform: visible ? 'translateY(0)' : 'translateY(50px)',
            transition: 'transform 0.8s ease-out',
            opacity: visible ? 1 : 0
          }}>
          <PreSaleCard
            title={title}
            subtitle={subtitle}
            gradientDirection={gradientDirection}
            gradientPrimaryColor={gradientPrimaryColor}
          />
        </Box>
      </Grow>
    </div>
  )
}

export const PreSaleWrapper = () => {
  const { classes } = useStyles()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'))
  const connection = getCurrentSolanaConnection()

  const dispatch = useDispatch()
  const isLoadingSaleStats = useSelector(saleSelectors.isLoadingSaleStats)
  const isLoadingUserStats = useSelector(saleSelectors.isLoadingUserStats)
  const saleStats = useSelector(saleSelectors.saleStats)
  const userStats = useSelector(saleSelectors.userStats)
  const { success, inProgress } = useSelector(saleSelectors.deposit)
  const tokens = useSelector(poolTokens)
  const nativeBalance = useSelector(balance)
  const walletStatus = useSelector(status)
  const isBalanceLoading = useSelector(balanceLoading)
  const proof = useSelector(proofOfInclusion)
  const [progress, setProgress] = useState<ProgressState>('none')
  const [tokenIndex, setTokenIndex] = useState<number | null>(null)
  const [currentTimestamp, setCurrentTimestamp] = useState<BN>(getTimestampSeconds())
  const initialReversePrices = localStorage.getItem('INVARIANT_SALE_REVERSE_PRICES') === 'true'
  const [reversedPrices, setReversedPrices] = useState(initialReversePrices)

  const slidesToShow = useMemo(() => {
    if (isSmallMobile) return 1
    if (isMobile) return 1
    if (isTablet) return 2
    return 3
  }, [isMobile, isTablet, isSmallMobile])

  const togglePriceDirection = useCallback(() => {
    setReversedPrices(prev => {
      const next = !prev
      localStorage.setItem('INVARIANT_SALE_REVERSE_PRICES', String(next))
      return next
    })
  }, [])

  const { targetAmount, currentAmount, whitelistWalletLimit, startTimestamp, duration, mint } =
    useMemo(
      () =>
        saleStats
          ? saleStats
          : {
              targetAmount: new BN(0),
              currentAmount: new BN(0),
              whitelistWalletLimit: new BN(0),
              startTimestamp: new BN(0),
              duration: new BN(0),
              mint: new PublicKey(0)
            },
      [saleStats]
    )

  useEffect(() => {
    const index = tokens.findIndex(token => token.assetAddress.equals(mint))
    if (index !== -1) setTokenIndex(index)
  }, [tokens, mint])

  const { deposited, received } = useMemo(
    () =>
      userStats
        ? userStats
        : {
            deposited: new BN(0),
            received: new BN(0)
          },
    [userStats]
  )

  const round = useMemo(() => getRound(currentAmount, targetAmount), [saleStats])

  const remainingAmount = useMemo(
    () => (!whitelistWalletLimit.isZero() ? whitelistWalletLimit.sub(deposited) : new BN(0)),
    [deposited, whitelistWalletLimit]
  )

  const amountNeeded = useMemo(() => {
    if (targetAmount.isZero()) return new BN(0)
    if (round === 4) return targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER)
    return getCurrentTierLimit(currentAmount, targetAmount)
  }, [currentAmount, targetAmount])

  const filledPercentage = useMemo(() => {
    if (targetAmount.isZero()) return new BN(0)
    if (round === 4)
      return currentAmount
        .muln(100)
        .mul(PERCENTAGE_DENOMINATOR)
        .div(targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER))
    return !amountNeeded.isZero()
      ? currentAmount.muln(100).mul(PERCENTAGE_DENOMINATOR).div(amountNeeded)
      : new BN(0)
  }, [currentAmount, amountNeeded, round])

  const amountLeft = useMemo(() => {
    if (targetAmount.isZero()) return new BN(0)
    if (round === 4) return targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER).sub(currentAmount)
    return getAmountTillNextPriceIncrease(currentAmount, targetAmount)
  }, [currentAmount, targetAmount])

  const mintDecimals = useMemo(
    () => (tokenIndex !== null ? tokens[tokenIndex].decimals : 0),
    [tokenIndex, tokens]
  )

  const tierPrices = useMemo(() => getTierPrices(mintDecimals), [mintDecimals])

  const { price, nextPrice } = useMemo(
    () => getPrice(currentAmount, targetAmount, mintDecimals),
    [currentAmount, targetAmount, mintDecimals]
  )

  const endtimestamp = useMemo(() => startTimestamp.add(duration), [startTimestamp, duration])

  const saleSoldOut = useMemo(
    () => currentAmount.eq(targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER)),
    [targetAmount, currentAmount]
  )

  const saleEnded = useMemo(() => {
    return currentTimestamp.gt(endtimestamp)
  }, [endtimestamp, currentTimestamp])

  const saleDidNotStart = useMemo(() => {
    return currentTimestamp.lt(startTimestamp)
  }, [startTimestamp, currentTimestamp])

  const isActive = useMemo(() => {
    return !saleDidNotStart && !saleEnded && !saleSoldOut
  }, [saleDidNotStart, saleEnded, saleSoldOut])

  const isPublic = useMemo(() => round === 4, [round])

  useEffect(() => {
    const wallet = getEclipseWallet()
    if (
      wallet &&
      walletStatus === Status.Initialized &&
      wallet.publicKey &&
      !wallet.publicKey.equals(DEFAULT_PUBLICKEY)
    ) {
      dispatch(actions.getProof())
    }
  }, [walletStatus, isPublic])

  const isLimitExceed = useMemo(
    () => deposited.gte(whitelistWalletLimit) && !isPublic,
    [round, deposited, connection]
  )

  const getAlertBoxText = useCallback(() => {
    if (isLimitExceed) {
      return {
        text: 'Your deposit exceed limit',
        variant: 'limit'
      }
    }
    if (!isPublic && proof?.length !== 0) {
      return { text: 'You are eligible for this round of sale' }
    }
    if (!isPublic && proof?.length === 0) {
      return {
        text: 'You are not eligible for this round of sale',
        variant: 'warning'
      }
    }
    if (isPublic) {
      return { text: 'Sale is currently in public state' }
    }
    if (!isActive) {
      return { text: 'Sale not active' }
    }
  }, [isPublic, proof, isLimitExceed])

  useEffect(() => {
    dispatch(actions.getSaleStats())
    dispatch(actions.getUserStats())
  }, [dispatch])

  useEffect(() => {
    const intervalId = setInterval(() => setCurrentTimestamp(getTimestampSeconds()), 1000)
    return () => {
      clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    let timeoutId1: NodeJS.Timeout
    let timeoutId2: NodeJS.Timeout

    if (!inProgress && progress === 'progress') {
      setProgress(success ? 'approvedWithSuccess' : 'approvedWithFail')

      timeoutId1 = setTimeout(() => {
        setProgress(success ? 'success' : 'failed')
      }, 500)

      timeoutId2 = setTimeout(() => {
        setProgress('none')
        dispatch(actions.setDepositSuccess(false))
      }, 1800)
    }

    return () => {
      clearTimeout(timeoutId1)
      clearTimeout(timeoutId2)
    }
  }, [success, inProgress])

  const displayPriceInfo = useMemo(() => {
    if (reversedPrices) {
      const tierIndex = round - 1
      const currentTierPrice =
        tierIndex >= 0 ? [TIER1, TIER2, TIER3, TIER4][Math.min(tierIndex, 3)] : price
      const nextTierPrice =
        tierIndex > 0 ? [TIER1, TIER2, TIER3, TIER4][Math.min(tierIndex + 1, 3)] : nextPrice
      return {
        currentPrice: currentTierPrice,
        nextPrice: nextTierPrice
      }
    }

    return {
      currentPrice: price,
      nextPrice: nextPrice
    }
  }, [price, nextPrice, round, reversedPrices])

  const stepLabels = useMemo(() => {
    return tierPrices.map((price, idx) => {
      if (reversedPrices && !price.isZero()) {
        const baseValue = new BN(10).pow(new BN(mintDecimals))
        const inverted = baseValue.mul(baseValue).div(price)
        return {
          id: idx + 1,
          label: `1$ = ${printBNandTrimZeros(inverted, mintDecimals, 2)} INVT`
        }
      } else {
        return {
          id: idx + 1,
          label: `1 INVT = ${printBNandTrimZeros(price, mintDecimals, 4)}$`
        }
      }
    })
  }, [tierPrices, reversedPrices, mintDecimals])

  return (
    <Grid className={classes.pageWrapper} sx={{ position: 'relative' }}>
      <Hidden lgDown>
        <OverlayWrapper />
      </Hidden>

      <Box className={classes.contentWrapper}>
        <Grid className={classes.stepperContainer}>
          <SaleStepper isLoading={isLoadingSaleStats} currentStep={round - 1} steps={stepLabels} />
          <Box className={classes.roundComponentContainer}>
            <RoundComponent
              isActive={isActive}
              saleDidNotStart={saleDidNotStart}
              targetAmount={targetAmount}
              amountDeposited={currentAmount}
              amountNeeded={amountNeeded}
              amountLeft={amountLeft}
              currentPrice={displayPriceInfo.currentPrice}
              walletStatus={walletStatus}
              nextPrice={displayPriceInfo.nextPrice}
              proofOfInclusion={proof}
              percentageFilled={filledPercentage}
              userDepositedAmount={deposited}
              userReceivededAmount={received}
              userRemainingAllocation={remainingAmount}
              isReversed={reversedPrices}
              mintDecimals={mintDecimals}
              roundNumber={round}
              isLoadingSaleStats={isLoadingSaleStats}
              isLoadingUserStats={isLoadingUserStats}
              priceFormat={reversedPrices ? 'usdc-to-token' : 'token-to-usdc'}
            />
            <Grid className={classes.reverseContainer}>
              <div className={classes.arrowIcon} onClick={togglePriceDirection}>
                <span className={`${classes.reverseText} reverseText`}>Reverse token</span>
                <img src={swapArrowClean} alt='swap' />
              </div>
            </Grid>
          </Box>
        </Grid>
        <BuyComponent
          nativeBalance={nativeBalance}
          isPublic={isPublic}
          currentRound={round}
          saleDidNotStart={saleDidNotStart}
          saleEnded={saleEnded}
          saleSoldOut={saleSoldOut}
          isEligible={proof?.length !== 0}
          whitelistWalletLimit={whitelistWalletLimit}
          userDepositedAmount={deposited}
          isActive={isActive}
          progress={progress}
          isLoading={isLoadingSaleStats}
          targetAmount={round === 4 ? targetAmount.mul(EFFECTIVE_TARGET_MULTIPLIER) : targetAmount}
          currentAmount={currentAmount}
          mintDecimals={mintDecimals}
          startTimestamp={startTimestamp}
          tokens={tokens}
          walletStatus={walletStatus}
          alertBox={getAlertBoxText()}
          isBalanceLoading={isBalanceLoading}
          isLoadingUserStats={isLoadingUserStats}
          tokenIndex={tokenIndex}
          onConnectWallet={() => {
            dispatch(walletActions.connect(false))
          }}
          onDisconnectWallet={() => {
            dispatch(walletActions.disconnect())
          }}
          onBuyClick={amount => {
            if (tokenIndex === null) {
              return
            }
            if (progress === 'none') {
              setProgress('progress')
            }
            dispatch(
              actions.depositSale({
                amount,
                mint,
                proofOfInclusion: proof
              })
            )
          }}
        />
      </Box>
      <Box className={classes.sectionTitle}>
        <Typography className={classes.sectionTitleText}>Invariant by the Numbers</Typography>
        <Grid container className={classes.animatedCardsContainer}>
          <Grid item className={classes.animatedCardItem}>
            <AnimatedPreSaleCard
              title='~1M Users'
              gradientPrimaryColor={`${colors.invariant.green}`}
              subtitle='who have ever interacted with Invariant'
              delay={100}
            />
          </Grid>
          <Grid item className={classes.animatedCardItem}>
            <AnimatedPreSaleCard
              title='~$5 Billion'
              gradientDirection='to bottom'
              subtitle='in cumulative swap volume'
              delay={300}
            />
          </Grid>
          <Grid item className={classes.animatedCardItem}>
            <AnimatedPreSaleCard title='4 Hackatons' subtitle='won by Invariant team' delay={500} />
          </Grid>
          <Grid item className={classes.animatedCardItem}>
            <AnimatedPreSaleCard
              title=' $200K+'
              gradientPrimaryColor={`${colors.invariant.green}`}
              gradientDirection='to bottom'
              subtitle='earned in hackathon prizes'
              delay={700}
            />
          </Grid>
        </Grid>
      </Box>
      <Box className={classes.sectionTitle}>
        <Typography className={classes.sectionTitleText}>The most capital-efficient DEX</Typography>
        <Box className={classes.dexChartContainer}>
          <DEXChart />
        </Box>
      </Box>
      <Box className={classes.sectionTitle}>
        <Typography className={classes.sectionTitleText}>The Invariant Journey</Typography>
        <Box className={classes.cardsContainer}>
          <Slider
            speed={500}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
            arrows={true}
            draggable={true}
            dotsClass={`slick-dots ${classes.dots}`}
            dots={isSmallMobile}
            appendDots={dots => <ul>{dots}</ul>}
            className={classes.slider}
            autoplay={true}
            autoplaySpeed={10000}
            nextArrow={isSmallMobile ? null : <SampleNextArrow />}
            prevArrow={isSmallMobile ? null : <SamplePrevArrow />}
            rows={1}>
            <EventsCard
              title={'Solana Riptide Hackaton'}
              description={
                'First win comes at a major hackathon. Invariant celebrates its first big success.'
              }
              heroImage={SolanaHackatonHero}
            />
            <EventsCard
              title={'Solana Mainnet Launch'}
              borderColor='green'
              link='https://medium.com/@invariant_labs/what-is-invariant-introduction-351b17296136'
              description={
                'Invariant says hello to the world. The first transaction on Solana Mainnet is now complete.'
              }
              heroImage={SolanaMainNetHero}
            />
            <EventsCard
              title={'Alephium Hackathon'}
              link='https://medium.com/@alephium/hackathon-winners-announced-68d55711b99d'
              description={
                'Second hackathon win on Alephium. Invariant secures $15k and proves its skills once again.'
              }
              heroImage={AlphHackatonHero}
            />
            <EventsCard
              title={'Eclipse Hackathon Win'}
              link='https://x.com/invariant_labs/status/1839676182884663721'
              description={`Third time's the charm. Invariant wins the opening hackathon on Eclipse, earns $15k, and steps into the spotlight.`}
              heroImage={EclipseHackatonHero}
            />
            <EventsCard
              title={'Eclipse Mainnet Launch'}
              link='https://x.com/invariant_labs/status/1849106452259991654'
              borderColor={'pink'}
              description={
                'Invariant expands to new SVMs. After being the first app on Eclipse testnet and tested by thousands, Invariant launches on mainnet.'
              }
              heroImage={EclipseMainNetHero}
            />
            <EventsCard
              title={'$8MLN TVL'}
              link='https://x.com/invariant_labs/status/1890092960815149087'
              borderColor={'green'}
              description={'In just four months, TVL on Eclipse surpasses 8 million dollars.'}
              heroImage={TVLHero}
            />
            <EventsCard
              title={'250k+ users on Eclipse'}
              link='https://x.com/invariant_labs/status/1912589859811913986'
              description={
                'After six months on Eclipse mainnet, Invariant surpasses a massive milestone of 250,000 users.'
              }
              heroImage={UsersHero}
            />
            <EventsCard
              title={'Sonic Mobius Hackaton'}
              link='https://x.com/SonicSVM/status/1910590750024147382'
              borderColor={'green'}
              description={
                'Invariant wins the Sonic hackathon with its breakthrough AutoSwap feature. A new era of liquidity provision begins.'
              }
              heroImage={SonicHacktonHero}
            />
            <EventsCard
              title={'AutoSwap Launch'}
              link='https://x.com/invariant_labs/status/1912894700614271377'
              description={
                'AutoSwap launches on Eclipse. In its first week, it improves the experience for countless users who create thousands of positions with its help.'
              }
              heroImage={AutoswapHero}
            />
            <EventsCard
              title={'Public Sale Begins'}
              borderColor={'pink'}
              description={
                'Invariant launches on Solana mainnet. The first AMM with AutoSwap goes live.'
              }
              heroImage={PubliSaleHero}
            />
          </Slider>
        </Box>
      </Box>
      <Box className={classes.sectionTokenomics}>
        <Typography className={classes.sectionTitleText}>Tokenomics</Typography>
        <Tokenomics />
      </Box>
      <Box className={classes.sectionTitle}>
        <Typography className={classes.sectionTitleText}>Audited By</Typography>
        <img src={auditByLogoIcon} alt='Audit' width={289} />
      </Box>
      <Box className={classes.sectionTitle}>
        <Typography className={classes.sectionTitleText}>Frequently Asked Questions</Typography>
        <Faq
          faqData={[
            {
              question: '1. How can I participate in the public sale?',
              answer:
                'To participate, simply scroll up to the presale section, connect your crypto wallet, enter the amount you’d like to invest, and click Buy Now. Tokens will be transferred after purchase.'
            },
            {
              question: '2. What is the initial token price?',
              answer:
                'The initial price is set at <span style="color: #2EE09A; font-weight: bold;">0.10$</span> during Round 1, with a gradual increase in each subsequent round.'
            },
            {
              question: '3. When can I claim my tokens?',
              answer: `
                  Purchased tokens will be available to claim during the <span style="color: #2EE09A; font-weight: bold;">Token Generation Event (TGE)</span>.
                `
            },
            {
              question: '4. When is the TGE?',
              answer:
                'The TGE will take place shortly after the public sale ends. We’ll announce the exact date on our official social media channels.'
            },
            {
              question: '5. How do I know if I’m whitelisted?',
              answer: `You can check your whitelist status and the round you're eligible for using the <span style="color: #2EE09A; font-weight: bold;">Whitelist Checker</span> at the top of the page. </br>
                
                If you're not whitelisted, don't worry — you’ll be able to participate in <span style="color: #2EE09A; font-weight: bold;">Round 4</span>, which is open to everyone.
                `
            },
            {
              question: `6. How can I contact the Invariant team?`,
              answer: `Feel free to reach out to us on Discord or through any of our official channels: <b> </br> <ul><li><a href="https://discord.com/invite/w6hTeWTJvG" style="color: #2EE09A" target="_blank">Discord</a></li><li><a href="mailto:contact@invariant.app" style="color: #2EE09A">Email</a></li><li><a href="https://x.com/invariant_labs" style="color: #2EE09A" target="_blank">X</a></li></ul><p>The Terms and Conditions of the Invariant Points Program are available <a href="https://docs.invariant.app/docs/points_terms" style="color: #2EE09A" target="_blank">here.</a></p> </b>`
            }
          ]}
        />
      </Box>
    </Grid>
  )
}
