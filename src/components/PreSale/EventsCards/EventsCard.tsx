import { Box, Typography } from '@mui/material'
import React from 'react'
import EventCard from '@static/png/presale/event-card-bg.png'
import useStyles from './style'

interface EventsCardProps {
    title?: string;
    description?: string;
    heroImage?: string;
    borderColor?: 'textGrey' | 'green' | 'pink';
    isImportant?: boolean;
    link?: string;
    heroImageSize?: {
        width: number;
        height: number;
    };
}

export const EventsCard: React.FC<EventsCardProps> = ({
    title,
    description,
    heroImage,
    link,
    borderColor = 'textGrey',
    heroImageSize = { width: 245, height: 207 },
    isImportant = false,
}) => {
    const { classes } = useStyles({ borderColor, isImportant, link });

    return (
        <Box className={classes.container} onClick={() =>
            link ? window.open(link, '_blank') : null
        }>
            <Box
                className={classes.backgroundImage}
                sx={{ backgroundImage: `url(${EventCard})` }}
            />
            <Box className={classes.contentWrapper}>
                <Box className={classes.imageContainer}>
                    <img src={heroImage} alt="" style={{ maxWidth: heroImageSize.width, maxHeight: heroImageSize.height }} />
                </Box>
                <Typography className={classes.title}>
                    {title}
                </Typography>
                <Typography className={classes.description}>
                    {description}
                </Typography>
            </Box>
        </Box>
    )
}