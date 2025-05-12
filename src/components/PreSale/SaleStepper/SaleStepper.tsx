import React from 'react';
import { Box, Typography } from '@mui/material';
import useStyles from './style';

export interface StepItem {
    id: number;
    label: string;
}

interface SaleStepperProps {
    steps: StepItem[];
    currentStep: number;
}



export const SaleStepper: React.FC<SaleStepperProps> = ({ steps, currentStep }) => {
    const connectorHeight = Math.round(720 / steps.length - 60);
    const { classes } = useStyles({ connectorHeight });
    const getConnectorClass = (index: number, steps: StepItem[], currentStep: number, classes: any): string => {
        const isLast = index === steps.length - 1;
        if (isLast) return '';

        const step = steps[index];
        const nextStep = steps[index + 1];
        const isCompleted = step.id <= currentStep;
        const isNextCompleted = nextStep.id <= currentStep;
        const hasIntermediateNode = index > 0 && index < steps.length - 2 && steps.length >= 3;

        if (hasIntermediateNode && currentStep > 2) {
            return classes.connectorGray;
        }

        if (isCompleted && isNextCompleted) {
            return hasIntermediateNode ? classes.connectorGreenGrayPink : classes.connectorGreenPink;
        } else if (isCompleted && !isNextCompleted) {
            return classes.connectorGreenGrayPink;
        } else {
            return classes.connector;
        }
    };



    return (
        <Box className={classes.container}>
            {steps.map((step, index) => {
                const isFirst = index === 0;
                const isLast = index === steps.length - 1;

                const connectorClass = getConnectorClass(index, steps, currentStep, classes);

                return (
                    <Box
                        key={step.id}
                        className={`${classes.stepContainer} ${index < steps.length - 1 ? classes.stepMargin : ''}`}
                    >
                        <Box
                            className={`${classes.stepCircle} ${index <= currentStep
                                ? isFirst
                                    ? classes.startStepNode
                                    : index === currentStep
                                        ? classes.endStepNode
                                        : classes.middleStepNode
                                : ''
                                }`}
                        >
                            <Typography variant="body1">{step.id}</Typography>
                        </Box>

                        <Typography variant="body2" className={classes.stepLabel}>
                            {step.label}
                        </Typography>

                        {!isLast && <Box className={`${classes.connector} ${connectorClass}`} />}
                    </Box>
                );
            })}
        </Box>
    );
}