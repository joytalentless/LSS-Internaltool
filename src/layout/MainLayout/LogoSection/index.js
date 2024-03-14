import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { Link } from '@mui/material';

// project imports
import { DASHBOARD_PATH } from 'config';
import LogoH from 'ui-component/Logo horizontal';

// ==============================|| MAIN LOGO ||============================== //

const LogoSection = () => (
    <Link component={RouterLink} to={DASHBOARD_PATH} aria-label="logo" style={{ textDecoration: 'none', color: 'black' }}>
        <LogoH />
    </Link>
);

export default LogoSection;
