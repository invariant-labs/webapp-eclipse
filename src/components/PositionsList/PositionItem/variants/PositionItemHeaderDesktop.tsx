import { Grid, Typography } from '@mui/material'
import { colors } from '@static/theme'
import { makeStyles } from 'tss-react/mui'
//Na input token
// Jezeli title ETH -> USDC
//
export const PositionItemHeaderDesktop: React.FC = () => {
  const { classes } = useStyles()

  return (
    <Grid container className={classes.headerRoot}>
      <Grid container direction='row' alignItems='center' justifyContent='space-between'>
        {/* First column - Pair name */}
        <Grid container item xs={4} className={classes.pairNameCell}>
          <Typography className={classes.headerText}>Pair name</Typography>
        </Grid>

        {/* Container for right-side items */}
        <Grid
          container
          item
          sx={{
            width: 'fit-content',
            flexWrap: 'nowrap',
            justifyContent: 'flex-end',
            flex: 1
          }}>
          {/* Fee tier */}
          <Grid item sx={{ width: 65 }} className={classes.centerCell}>
            <Typography className={classes.headerText}>Fee tier</Typography>
          </Grid>

          {/* Token ratio */}
          <Grid item sx={{ width: 170 }} className={classes.centerCell}>
            <Typography className={classes.headerText}>Token ratio</Typography>
          </Grid>

          {/* Value */}
          <Grid item sx={{ width: 100 }} className={classes.centerCell}>
            <Typography className={classes.headerText}>Value</Typography>
          </Grid>

          {/* Fee */}
          <Grid item sx={{ width: 100 }} className={classes.centerCell}>
            <Typography className={classes.headerText}>Fee</Typography>
          </Grid>

          {/* Chart/Range */}
          <Grid item sx={{ width: 230 }} className={classes.centerCell}>
            <Typography className={classes.headerText}>Chart</Typography>
          </Grid>

          {/* Action */}
          <Grid item sx={{ width: 36 }} className={classes.centerCell}>
            <Typography className={classes.headerText}>Action</Typography>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}

// Styles
const useStyles = makeStyles()(theme => ({
  headerRoot: {
    padding: '12px 20px',
    background: colors.invariant.component,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    marginBottom: '-8px'
  },
  headerText: {
    fontSize: '16px',
    lineHeight: '24px',
    color: colors.invariant.textGrey,
    fontWeight: 400,
    whiteSpace: 'nowrap'
  },
  pairNameCell: {
    paddingLeft: '72px',
    flex: '0 0 auto'
  },
  centerCell: {
    display: 'flex',
    justifyContent: 'center',
    paddingRight: '8px'
  }
}))
