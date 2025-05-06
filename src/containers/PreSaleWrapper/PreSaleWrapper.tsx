import { Grid, Box } from '@mui/material'
import { useStyles } from './styles'
import { BuyComponent } from '@components/PreSale/BuyComponent/BuyComponent'
import { SaleStepper } from '@components/PreSale/SaleStepper/SaleStepper'
import { RoundComponent } from '@components/PreSale/RoundComponent/RoundComponent'
export const PreSaleWrapper = () => {
    const { classes } = useStyles()
    return (
        <Grid className={classes.pageWrapper}>
            <Box className={classes.infoContainer}>
                <Box className={classes.contentWrapper}>
                    <Grid className={classes.stepperContainer}>
                        <SaleStepper steps={[
                            { id: 1, label: "$0.30" },
                            { id: 2, label: "$0.11" },
                            { id: 3, label: "$0.13" },
                            { id: 4, label: "$0.15" }
                        ]} />
                        <Box className={classes.roundComponentContainer}>
                            <RoundComponent amountBought={3} amountLeft={4} currentPrice={43} nextPrice={32} percentageFilled={43} purchasedTokens={54} remainingAllocation={355} roundNumber={1} currency='INV' />
                        </Box>
                    </Grid>
                    <BuyComponent raisedAmount={'55354'} totalAmount='344444' alertBoxText='Test message' />
                </Box>
            </Box>
        </Grid>
    )
}
