import { Theme } from '@mui/material/styles';
import withStyles from '@mui/styles/withStyles';
import Tooltip from '@mui/material/Tooltip';
import { defaultTheme } from '../App';

export const LightTooltip = withStyles((theme: Theme) => {
    return ({
        tooltip: {
            backgroundColor: defaultTheme.palette.common.white,
            color: 'rgba(60, 60, 60, 0.87)',
            boxShadow: defaultTheme.shadows[3],
            maxWidth: 700,
            overflow: 'auto',
            fontSize: 11,
            '& strong': {
                color: '#000',
            }
        },
    });
}

)(Tooltip);