import { Box, Typography } from '@mui/material'
import React from 'react'
import useStyles from './style';
import { colors } from '@static/theme';

export interface PreSaleCardProps {
    title: string;
    subtitle: string;
    gradientDirection?: 'to right' | 'to left' | 'to top' | 'to bottom';
    gradientPrimaryColor?: string;

}
export const PreSaleCard: React.FC<PreSaleCardProps> = ({
    title,
    subtitle,
    gradientDirection = 'to top',
    gradientPrimaryColor = `${colors.invariant.pink}`,
}) => {
    const { classes } = useStyles({ gradientDirection, gradientPrimaryColor });


    return (
        <Box className={classes.container}>
            <Box className={classes.contentContainer}>
                <Typography className={`${classes.title}`}>{title}</Typography>
                <Typography className={`${classes.subtitle}`}>{subtitle}</Typography>
            </Box>

        </Box>
    );
};