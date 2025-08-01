import React from 'react'
import { Grid } from '@mui/material'
import { useStyles } from './styles'

interface IProps {}

const OrderHistory: React.FC<IProps> = ({}) => {
  const { classes } = useStyles()

  return <Grid>Order History</Grid>
}

export default OrderHistory
