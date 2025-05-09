import { Grid, Box, Typography, Grow } from '@mui/material'
import { useStyles } from './styles'
import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
import { colors, typography } from '@static/theme'
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
import { useEffect, useState, useRef } from 'react'
import { OverlayWrapper } from '@components/PreSale/Overlay/Overlay'

function SampleNextArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "block", backgroundImage: `url(${ArrowRight})`, backgroundSize: 'cover' }}
            onClick={onClick}
        />
    );
}

function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={className}
            style={{ ...style, display: "block", left: -25, backgroundImage: `url(${ArrowLeft})`, backgroundSize: 'cover' }}
            onClick={onClick}
        />
    );
}

const useIntersectionObserver = (options = {}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                if (ref.current) observer.unobserve(ref.current);
            }
        }, options);

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) observer.unobserve(ref.current);
        };
    }, [ref, options]);

    return { ref, isVisible };
};

const AnimatedPreSaleCard = ({ title, subtitle, imageSrc, imageDirection, delay, imageSize }: { title: string, imageSize?: { width: number, height: number }, subtitle: string, imageSrc?: string, imageDirection?: 'left' | 'right', delay: number }) => {
    const { ref: cardRef, isVisible: isCardVisible } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer;
        if (isCardVisible) {
            timer = setTimeout(() => {
                setVisible(true);
            }, delay);
        }

        return () => clearTimeout(timer);
    }, [isCardVisible, delay]);

    return (
        <div ref={cardRef}>
            <Grow
                in={visible}
                style={{ transformOrigin: '0 0 0' }}
                timeout={{
                    enter: 1000,
                }}
            >
                <Box sx={{
                    transform: visible ? 'translateY(0)' : 'translateY(50px)',
                    transition: 'transform 0.8s ease-out',
                    opacity: visible ? 1 : 0,
                }}>
                    <PreSaleCard title={title} subtitle={subtitle} imageSize={imageSize} imageSrc={imageSrc ?? null} imagePosition={imageDirection} />
                </Box>
            </Grow>
        </div>
    );
};

export const PreSaleWrapper = () => {
    const { classes } = useStyles();

    const { ref: cardsGridRef } = useIntersectionObserver({
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px'
    });

    return (
        <Grid className={classes.pageWrapper} sx={{ position: 'relative' }}>
            <Box className={classes.infoContainer}>
                <Box className={classes.contentWrapper}>
                    <Grid className={classes.stepperContainer}>
                        <SaleStepper steps={[
                            { id: 1, label: "$0.30" },
                            { id: 2, label: "$0.11" },
                            { id: 3, label: "$0.11" },
                            { id: 4, label: "$0.11" }
                        ]} />
                        <Box className={classes.roundComponentContainer}>
                            <RoundComponent isActive amountBought={3} amountLeft={4} currentPrice={43} nextPrice={32} percentageFilled={43} purchasedTokens={54} remainingAllocation={355} roundNumber={1} currency='INV' alertBoxText='Test message' />
                        </Box>
                    </Grid>
                    <BuyComponent isActive raisedAmount={'55354'} totalAmount='344444' />
                </Box>
                <OverlayWrapper />
            </Box>

            <Box >
                <Typography sx={{ ...typography.heading4, textAlign: 'center', color: colors.invariant.text }}>
                    Learn more about $INV
                </Typography>

                <Grid
                    ref={cardsGridRef}
                    container
                    spacing={1}
                    sx={{
                        display: 'flex',
                        width: '1280px',
                        justifyContent: 'center',
                        marginTop: '24px',
                        position: 'relative',
                        zIndex: 1
                    }}
                >
                    <>
                        <Grid item xs={12} sm={5}>
                            <AnimatedPreSaleCard
                                title='~1M Users'
                                subtitle='who have ever interacted with Invariant'
                                imageSrc={CardLogoGreen}
                                imageSize={{ width: 110, height: 120 }}
                                delay={100}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <AnimatedPreSaleCard
                                title='~$5 Billions'
                                subtitle='in cumulative swap volume'
                                delay={300}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <AnimatedPreSaleCard
                                title='4 Hackatons'
                                subtitle='won by Invariant team'
                                delay={500}
                            />
                        </Grid>
                        <Grid item xs={12} sm={5}>
                            <AnimatedPreSaleCard
                                title=' $200K+'
                                imageDirection='left'
                                subtitle='earned in hackathon prizes'
                                imageSrc={CardLogoPink}
                                delay={700}
                            />
                        </Grid>
                    </>
                </Grid>
            </Box>

            <Box>
                <Typography sx={{ ...typography.heading4, textAlign: 'center', color: colors.invariant.text }}>
                    Chronological cards
                </Typography>

                <Box className={classes.cardsContainer}>
                    <Slider
                        speed={500}
                        slidesToShow={3}
                        slidesToScroll={1}
                        arrows={true}
                        draggable={true}
                        className={classes.slider}
                        autoplay={true}
                        autoplaySpeed={10000}
                        nextArrow={<SampleNextArrow />}
                        prevArrow={<SamplePrevArrow />}
                        rows={1}>
                        <EventsCard title={'Solana Riptide Hackaton'} description={'First win comes at a major hackathon. Invariant celebrates its first big success.'} heroImage={CardHeroLogoPodium} />
                        <EventsCard title={'Eclipse Mainnet Launch'} borderColor={'pink'} description={'Invariant expands to new SVMs. After being the first app on Eclipse testnet and tested by thousands, Invariant launches on mainnet.'} heroImage={CardHeroLogoEclipse} />
                        <EventsCard title={'Sonic Mobius Hackaton'} borderColor={'green'} description={'Invariant wins the Sonic hackathon with its breakthrough AutoSwap feature. A new era of liquidity provision begins.'} heroImage={CardHeroLogoPodium} />
                        <EventsCard title={'Alephium Hackathon'} description={'Second hackathon win on Alephium. Invariant secures $15k and proves its skills once again.'} heroImage={CardHeroLogoPodium} />

                        <EventsCard title={'250k+ users on Eclipse'} description={'After six months on Eclipse mainnet, Invariant surpasses a massive milestone of 250,000 users.'} heroImage={CardHeroLogoEclipse} />

                        <EventsCard title={'$8MLN TVL'} borderColor={'green'} description={'In just four months, TVL on Eclipse surpasses 8 million dollars.'} heroImage={CardHeroLogoPodium} />

                        <EventsCard title={'AutoSwap Launch'} description={'AutoSwap launches on Eclipse. In its first week, it improves the experience for countless users who create thousands of positions with its help.'} heroImage={CardHeroLogoPodium} />

                        <EventsCard title={'Public Sale Begins'} borderColor={'pink'} description={'Invariant launches on Solana mainnet. The first AMM with AutoSwap goes live.'} heroImage={CardHeroLogoEclipse} />

                        <EventsCard title={'Solana Mainnet Launch'} borderColor='green' description={'Invariant says hello to the world. The first transaction on Solana Mainnet is now complete.'} heroImage={CardHeroLogoPodium} />

                        <EventsCard title={'Eclipse Hackathon Win'} description={`Third time's the charm. Invariant wins the opening hackathon on Eclipse, earns $15k, and steps into the spotlight.`} heroImage={CardHeroLogoPodium} />
                    </Slider>
                </Box>
            </Box>

            <Box sx={{ width: '1072px' }}>
                <Typography sx={{ ...typography.heading4, textAlign: 'center', color: colors.invariant.text, marginBottom: '32px' }}>
                    FAQ
                </Typography>

                <Box>
                    <Faq faqData={[
                        { question: 'What is the minimum investment amount?', answer: 'The minimum investment amount is $100.' },
                        { question: 'What is the maximum investment amount?', answer: 'The maximum investment amount is $10,000.' },
                        { question: 'What is the token price?', answer: 'The token price is $0.10.' },
                        { question: 'What is the total supply of tokens?', answer: 'The total supply of tokens is 1,000,000,000.' },
                        { question: 'What is the soft cap?', answer: 'The soft cap is $1,000,000.' },
                        { question: 'What is the hard cap?', answer: 'The hard cap is $10,000,000.' },
                    ]} />
                </Box>
            </Box>
        </Grid>
    )
}