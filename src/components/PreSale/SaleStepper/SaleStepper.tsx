import React from 'react';
import { Box, Typography } from '@mui/material';
import useStyles from './style';

export interface StepItem {
    id: number;
    label: string;
}

interface SaleStepperProps {
    steps: StepItem[];
}

export const SaleStepper: React.FC<SaleStepperProps> = ({ steps = [
    { id: 1, label: "$0.30" },
    { id: 2, label: "$0.11" },
    { id: 3, label: "$0.13" },
    { id: 4, label: "$0.15" }
] }) => {
    const { classes } = useStyles();

    return (
        <Box className={classes.container}>
            {steps.map((step, index) => (
                <Box
                    key={step.id}
                    className={`${classes.stepContainer} ${index < steps.length - 1 ? classes.stepMargin : ''}`}
                >
                    <Box className={classes.stepCircle}>
                        <Typography variant="body1">{step.id}</Typography>
                    </Box>

                    <Typography
                        variant="body2"
                        className={classes.stepLabel}
                    >
                        {step.label}
                    </Typography>

                    {index < steps.length - 1 && (
                        <Box className={classes.connector} />
                    )}
                </Box>
            ))}
        </Box>
    );
}