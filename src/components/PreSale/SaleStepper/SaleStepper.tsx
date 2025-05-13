import React from 'react';
import { Box, Skeleton, Typography, useMediaQuery, useTheme } from '@mui/material';
import useStyles from './style';
import { typography } from '@static/theme';

export interface StepItem {
    id: number;
    label: string;
}

interface SaleStepperProps {
    steps: StepItem[];
    currentStep: number;
    isLoading?: boolean;

}

export const SaleStepper: React.FC<SaleStepperProps> = ({ steps, currentStep, isLoading = false
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const connectorHeight = Math.round(720 / steps.length - 60);
    const connectorWidth = Math.round(850 / steps.length);
    const { classes } = useStyles({ connectorHeight, connectorWidth });

    const getVerticalConnectorClass = (index: number, steps: StepItem[], currentStep: number): string => {
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

    const getHorizontalConnectorClass = (index: number, steps: StepItem[], currentStep: number): string => {
        const isLast = index === steps.length - 1;
        if (isLast) return '';

        const step = steps[index];
        const nextStep = steps[index + 1];
        const isCompleted = step.id <= currentStep;
        const isNextCompleted = nextStep.id <= currentStep;
        const hasIntermediateNode = index > 0 && index < steps.length - 2 && steps.length >= 3;

        if (hasIntermediateNode && currentStep > 2) {
            return classes.horizontalConnectorGray;
        }

        if (isCompleted && isNextCompleted) {
            return hasIntermediateNode ? classes.horizontalConnectorGreenGrayPink : classes.horizontalConnectorGreenPink;
        } else if (isCompleted && !isNextCompleted) {
            return classes.horizontalConnectorGreenGrayPink;
        } else {
            return classes.horizontalConnector;
        }
    };

    const getNodeClass = (index: number, isFirst: boolean): string => {
        let nodeClass = classes.stepCircle;

        if (index < currentStep) {
            nodeClass += isFirst ? ` ${classes.startStepNode}` : ` ${classes.middleStepNode}`;
        } else if (index === currentStep) {
            nodeClass += ` ${classes.endStepNode}`;
        }

        return nodeClass;
    };

    const getStepLabelClass = (index: number): string => {
        let labelClass = classes.stepLabel;

        if (index === currentStep) {
            labelClass += ` ${classes.currentStepLabel}`;
        } else if (index < currentStep) {
            labelClass += ` ${classes.startStepLabel}`;
        } else if (index > currentStep) {
            labelClass += ` ${classes.pendingStepLabel}`;
        }

        return labelClass;
    };

    return (
        <Box className={classes.container}>
            {steps.map((step, index) => {
                const isFirst = index === 0;
                const isLast = index === steps.length - 1;

                const verticalConnectorClass = getVerticalConnectorClass(index, steps, currentStep);
                const horizontalConnectorClass = getHorizontalConnectorClass(index, steps, currentStep);

                const nodeClass = getNodeClass(index, isFirst);
                const labelClass = getStepLabelClass(index);

                return (
                    <Box
                        key={step.id}
                        className={`${classes.stepContainer} ${!isLast ? classes.stepMargin : ''}`}
                    >
                        <Box className={classes.stepContent}>

                            <Box className={nodeClass}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        ...typography.body1,
                                        lineHeight: isMobile ? '24px' : '32px',
                                    }}
                                >
                                    {step.id}
                                </Typography>
                            </Box>

                            {isLoading ? (
                                <Skeleton
                                    variant="text"
                                    width={30}
                                    height={24}
                                    className={classes.labelSkeleton}
                                />
                            ) : (
                                <Typography
                                    variant="body2"
                                    className={labelClass}
                                >
                                    {step.label}
                                </Typography>
                            )}
                        </Box>

                        {!isLast && (
                            <>
                                <Box className={verticalConnectorClass} />

                                <Box className={horizontalConnectorClass} />
                            </>
                        )}
                    </Box>
                );
            })}
        </Box>
    );
};

export default SaleStepper;