import { Theme, withStyles } from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

export const LightTooltip = withStyles((theme: Theme) => ({
    tooltip: {
        backgroundColor: theme.palette.common.white,
        color: 'rgba(60, 60, 60, 0.87)',
        boxShadow: theme.shadows[3],
        maxWidth: 400,
        fontSize: 11,
        '& strong': {
            color: '#000',
        }
    },
}))(Tooltip);