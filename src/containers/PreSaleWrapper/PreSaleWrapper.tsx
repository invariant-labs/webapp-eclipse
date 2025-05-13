import { Grid, Box, Typography, Grow, useMediaQuery, Hidden } from '@mui/material'
import { useStyles } from './styles'
import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
import { useDispatch, useSelector } from 'react-redux'
import { actions } from '@store/reducers/sale'
import { Status, actions as walletActions } from '@store/reducers/solanaWallet'
import { saleSelectors } from '@store/selectors/sale'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { printBNandTrimZeros } from '@utils/utils'
import {
  EFFECTIVE_TARGET_MULTIPLIER,
  getRound,
  getTierPrices,
  getCurrentTierLimit,
  PERCENTAGE_DENOMINATOR
} from '@invariant-labs/sale-sdk'
import { balanceLoading, status, poolTokens, balance } from '@store/selectors/solanaWallet'
import {
  getAmountTillNextPriceIncrease,
  getPrice,
  getProof,
  getTimestampSeconds
} from '@invariant-labs/sale-sdk/lib/utils'
import { ProgressState } from '@common/AnimatedButton/AnimatedButton'

import { colors, typography, theme } from '@static/theme'
import { Faq } from '@common/Faq/Faq'
import { PreSaleCard } from '@components/PreSale/PreSaleCard/PreSaleCard'
import CardHeroLogoPodium from '@static/png/presale/podium.png'
import CardHeroLogoEclipse from '@static/png/presale/inv_eclipse.png'
import CardLogoPink from '@static/png/presale/pink_card_logo.png'
import CardLogoGreen from '@static/png/presale/green_card_logo.png'
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
        zIndex: 3,
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
        zIndex: 3,

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
  subtitleColorVariant,
  imageSrc,
  imageDirection,
  delay,
  imageSize
}: {
  title: string
  subtitleColorVariant?: 'white' | 'pink' | 'green'
  imageSize?: { width: number; height: number }
  subtitle: string
  imageSrc?: string
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
            titleColorVariant={subtitleColorVariant}
            imageSize={imageSize}
            imageSrc={imageSrc ?? null}
            imagePosition={imageDirection}
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
  const isDesk = useMediaQuery(theme.breakpoints.up('lg'))
  const isTablet = useMediaQuery(theme.breakpoints.up('md'))

  const { ref: cardsGridRef } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  })
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
  const [progress, setProgress] = useState<ProgressState>('none')
  const [tokenIndex, setTokenIndex] = useState<number | null>(null)
  const [currentTimestamp, setCurrentTimestamp] = useState<BN>(getTimestampSeconds())

  const slidesToShow = useMemo(() => {
    if (isSmallMobile) return 1;
    if (isMobile) return 1;
    if (isTablet) return 2;
    return 3;
  }, [isMobile, isSmallMobile]);

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

  const { deposited } = useMemo(
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

  const filledPercentage = useMemo(
    () =>
      !whitelistWalletLimit.isZero()
        ? currentAmount.muln(100).mul(PERCENTAGE_DENOMINATOR).div(whitelistWalletLimit)
        : 0,
    [currentAmount, whitelistWalletLimit]
  )

  const amountNeeded = useMemo(
    () => getCurrentTierLimit(currentAmount, targetAmount),
    [currentAmount, targetAmount]
  )

  const amountLeft = useMemo(
    () => getAmountTillNextPriceIncrease(currentAmount, targetAmount),
    [currentAmount, targetAmount]
  )

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

  const isActive = true

  const isPublic = useMemo(() => round === 4, [round])

  const proofOfInclusion = useMemo(() => {
    const wallet = getEclipseWallet()
    if (
      wallet &&
      walletStatus === Status.Initialized &&
      wallet.publicKey &&
      !wallet.publicKey.equals(DEFAULT_PUBLICKEY)
    )
      return getProof(wallet.publicKey.toString())
  }, [walletStatus, isPublic, nativeBalance])

  const getAlertBoxText = useCallback(() => {
    if (!isPublic && !!proofOfInclusion) {
      return 'You are eligible for this round of sale'
    }
    if (!isPublic && !proofOfInclusion) {
      return 'You are not eligible for this round of sale'
    }
    if (isPublic) {
      return 'Sale is currently in public state'
    }
    if (!isActive) {
      return 'Sale not active'
    }
  }, [isPublic, proofOfInclusion])

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

  const isLgDown = useMediaQuery(theme.breakpoints.down('lg'))
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'))
  const isSmDown = useMediaQuery('@media (max-width:700px)')

  const slidesNumber = useMemo(() => {
    if (isSmDown) return 1
    if (isMdDown) return 2
    if (isLgDown) return 3
    return 3
  }, [isMdDown, isLgDown, isSmDown])


  return (
    <Grid className={classes.pageWrapper} sx={{ position: 'relative' }}>
      <Box className={classes.infoContainer}>
        <Box className={classes.contentWrapper}>
          <Grid className={classes.stepperContainer}>
            <SaleStepper
              isLoading={true}
              currentStep={round}
              steps={tierPrices.map((price, idx) => {
                return { id: idx + 1, label: `$${printBNandTrimZeros(price, mintDecimals, 3)}` }
              })}
            />
            <Box className={classes.roundComponentContainer}>
              <RoundComponent
                isActive={isActive}
                saleDidNotStart={saleDidNotStart}
                targetAmount={targetAmount}
                amountDeposited={currentAmount}
                amountNeeded={amountNeeded}
                amountLeft={amountLeft}
                currentPrice={price}
                nextPrice={nextPrice}
                percentageFilled={filledPercentage}
                userDepositedAmount={deposited}
                userRemainingAllocation={remainingAmount}
                mintDecimals={mintDecimals}
                roundNumber={round}
                isLoading={true}
              />
            </Box>
          </Grid>
          <BuyComponent
            nativeBalance={nativeBalance}
            isPublic={isPublic}
            saleDidNotStart={saleDidNotStart}
            saleEnded={saleEnded}
            saleSoldOut={saleSoldOut}
            isEligible={!!proofOfInclusion}
            whitelistWalletLimit={whitelistWalletLimit}
            userDepositedAmount={deposited}
            isActive={isActive}
            progress={progress}
            isLoading={isLoadingSaleStats || isLoadingUserStats || isBalanceLoading}
            targetAmount={targetAmount}
            currentAmount={currentAmount}
            mintDecimals={mintDecimals}
            startTimestamp={startTimestamp}
            tokens={tokens}
            walletStatus={walletStatus}
            alertBoxText={getAlertBoxText()}
            isBalanceLoading={isBalanceLoading}
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
                  proofOfInclusion
                })
              )
            }}
          />
        </Box>
        <Hidden lgDown>
          <OverlayWrapper />
        </Hidden>
      </Box>

      <Box className={classes.sectionTitle}>
        <Typography
          sx={{ ...typography.heading4, textAlign: 'center', color: colors.invariant.text }}>
          Invariant by the Numbers
        </Typography>

        <Box className={classes.animatedCardsContainer}>
          <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: '24px',
              position: 'relative',
              zIndex: 1
            }}>
            <Box className={classes.animatedCardWrapper}>

              <Grid item xs={12} className={classes.animatedCardItem}>
                <AnimatedPreSaleCard
                  title='~1M Users'
                  subtitleColorVariant='green'
                  subtitle='who have ever interacted with Invariant'
                  delay={100}
                />
              </Grid>
              <Grid item xs={12} className={classes.animatedCardItem}>
                <AnimatedPreSaleCard
                  title='~$5 Billions'
                  subtitleColorVariant='pink'
                  subtitle='in cumulative swap volume'
                  delay={300}
                />
              </Grid>
            </Box>
            <Box className={classes.animatedCardWrapper}>

              <Grid item xs={12} className={classes.animatedCardItem}>
                <AnimatedPreSaleCard
                  title='4 Hackatons'
                  subtitle='won by Invariant team'
                  delay={500}
                />
              </Grid>
              <Grid item xs={12} className={classes.animatedCardItem}>
                <AnimatedPreSaleCard
                  title=' $200K+'
                  imageDirection='left'
                  subtitleColorVariant='green'
                  subtitle='earned in hackathon prizes'
                  delay={700}
                />
              </Grid>
            </Box>
          </Grid>
        </Box >
      </Box >

      <Box className={classes.sectionTitle}>
        <Typography
          sx={{ ...typography.heading4, textAlign: 'center', color: colors.invariant.text }}>
          The Invariant Journey
        </Typography>

        <Box className={classes.cardsContainer}>
          <Slider
            speed={500}
            slidesToShow={slidesToShow}
            slidesToScroll={1}
            arrows={true}
            draggable={true}
            centerMode={true}
            className={classes.slider}
            autoplay={true}
            autoplaySpeed={10000}
            nextArrow={<SampleNextArrow />}
            prevArrow={<SamplePrevArrow />}
            rows={1}>
            <EventsCard
              title={'Solana Riptide Hackaton'}
              description={
                'First win comes at a major hackathon. Invariant celebrates its first big success.'
              }
              heroImage={CardHeroLogoPodium}
            />
            <EventsCard
              title={'Eclipse Mainnet Launch'}
              borderColor={'pink'}
              description={
                'Invariant expands to new SVMs. After being the first app on Eclipse testnet and tested by thousands, Invariant launches on mainnet.'
              }
              heroImage={CardHeroLogoEclipse}
            />
            <EventsCard
              title={'Sonic Mobius Hackaton'}
              borderColor={'green'}
              description={
                'Invariant wins the Sonic hackathon with its breakthrough AutoSwap feature. A new era of liquidity provision begins.'
              }
              heroImage={CardHeroLogoPodium}
            />
            <EventsCard
              title={'Alephium Hackathon'}
              description={
                'Second hackathon win on Alephium. Invariant secures $15k and proves its skills once again.'
              }
              heroImage={CardHeroLogoPodium}
            />

            <EventsCard
              title={'250k+ users on Eclipse'}
              description={
                'After six months on Eclipse mainnet, Invariant surpasses a massive milestone of 250,000 users.'
              }
              heroImage={CardHeroLogoEclipse}
            />

            <EventsCard
              title={'$8MLN TVL'}
              borderColor={'green'}
              description={'In just four months, TVL on Eclipse surpasses 8 million dollars.'}
              heroImage={CardHeroLogoPodium}
            />

            <EventsCard
              title={'AutoSwap Launch'}
              description={
                'AutoSwap launches on Eclipse. In its first week, it improves the experience for countless users who create thousands of positions with its help.'
              }
              heroImage={CardHeroLogoPodium}
            />

            <EventsCard
              title={'Public Sale Begins'}
              borderColor={'pink'}
              description={
                'Invariant launches on Solana mainnet. The first AMM with AutoSwap goes live.'
              }
              heroImage={CardHeroLogoEclipse}
            />

            <EventsCard
              title={'Solana Mainnet Launch'}
              borderColor='green'
              description={
                'Invariant says hello to the world. The first transaction on Solana Mainnet is now complete.'
              }
              heroImage={CardHeroLogoPodium}
            />

            <EventsCard
              title={'Eclipse Hackathon Win'}
              description={`Third time's the charm. Invariant wins the opening hackathon on Eclipse, earns $15k, and steps into the spotlight.`}
              heroImage={CardHeroLogoPodium}
            />
          </Slider>
        </Box>
      </Box >

      {/* Sekcja "FAQ" */}
      < Box className={classes.faqContainer} >
        <Typography
          sx={{
            ...typography.heading4,
            textAlign: 'center',
            color: colors.invariant.text,
            marginBottom: '32px'
          }}>
          FAQ
        </Typography>

        <Box>
          <Faq
            faqData={[
              {
                question: 'What is the minimum investment amount?',
                answer: 'The minimum investment amount is $100.'
              },
              {
                question: 'What is the maximum investment amount?',
                answer: 'The maximum investment amount is $10,000.'
              },
              { question: 'What is the token price?', answer: 'The token price is $0.10.' },
              {
                question: 'What is the total supply of tokens?',
                answer: 'The total supply of tokens is 1,000,000,000.'
              },
              { question: 'What is the soft cap?', answer: 'The soft cap is $1,000,000.' },
              { question: 'What is the hard cap?', answer: 'The hard cap is $10,000,000.' }
            ]}
          />
        </Box>
      </Box >
    </Grid >
  )
}