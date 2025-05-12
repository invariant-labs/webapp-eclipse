import { Box, Typography } from '@mui/material'
import React from 'react'
import useStyles from './style';

export interface PreSaleCardProps {
    title: string;
    titleColorVariant?: 'white' | 'pink' | 'green';
    subtitle: string;
    imageSrc: string | null;
    imagePosition?: 'left' | 'right';
    imageSize?: {
        width: number;
        height: number;
    };
    imageOffsetTop?: number;
    imageOffsetSide?: number;
}
export const PreSaleCard: React.FC<PreSaleCardProps> = ({
    title,
    subtitle,
    titleColorVariant,
    imageSrc,
    imagePosition = 'right',
    imageSize = { width: 120, height: 100 },
    imageOffsetTop = 70,
    imageOffsetSide = 90,
}) => {
    const { classes } = useStyles({
        imagePosition,
        imageOffsetTop,
        imageOffsetSide
    });

    const getTitleColor = (titleColorVariant?: 'white' | 'pink' | 'green') => {
        switch (titleColorVariant) {
            case 'white':
                return classes.titleWhite;
                break;
            case 'pink':
                return classes.titlePink;
                break;
            case 'green':
                return classes.titleGreen;
                break;
            default:
                return classes.titleWhite;
        }
    }
    return (
        <Box className={classes.container}>
            <Box className={classes.contentContainer}>
                <Typography className={`${classes.title} ${getTitleColor(titleColorVariant)}`}>{title}</Typography>
                <Typography className={`${classes.subtitle}`}>{subtitle}</Typography>
            </Box>
            {imageSrc && (

                <Box className={classes.imageContainer}>
                    <img
                        src={imageSrc}
                        alt="Card image"
                        style={{
                            width: `${imageSize.width}px`,
                            height: `${imageSize.height}px`
                        }}
                    />
                </Box>
            )}
        </Box>
    );
};