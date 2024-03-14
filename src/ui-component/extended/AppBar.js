import PropTypes from 'prop-types';
import { cloneElement } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import { AppBar as MuiAppBar, Button, Container, Link, Stack, Toolbar, Typography, useScrollTrigger } from '@mui/material';

// project imports
import Logo from 'ui-component/Logo';

// elevation scroll
function ElevationScroll({ children, window }) {
    const theme = useTheme();
    const trigger = useScrollTrigger({
        disableHysteresis: true,
        threshold: 0,
        target: window
    });

    return cloneElement(children, {
        elevation: trigger ? 1 : 0,
        style: {
            backgroundColor: theme.palette.mode === 'dark' && trigger ? theme.palette.dark[800] : theme.palette.background.default,
            color: theme.palette.text.dark
        }
    });
}

ElevationScroll.propTypes = {
    children: PropTypes.node,
    window: PropTypes.object
};

// ==============================|| MINIMAL LAYOUT APP BAR ||============================== //

const AppBar = ({ ...others }) => (
    <ElevationScroll {...others}>
        <MuiAppBar color="grey">
            <Container>
                <Toolbar sx={{ py: 2.5, px: `0 !important` }}>
                    <Typography component="div" sx={{ flexGrow: 1, textAlign: 'left', textDecoration: 'none', color: 'black' }}>
                        <Logo />
                    </Typography>
                    <Stack direction="row" sx={{ display: { xs: 'none', sm: 'block' } }} spacing={{ xs: 1.5, md: 2.5 }}>
                        <Button color="inherit" component={Link} href="#">
                            Home
                        </Button>
                        <Button color="inherit" component={RouterLink} to="/login">
                            Login
                        </Button>
                    </Stack>
                </Toolbar>
            </Container>
        </MuiAppBar>
    </ElevationScroll>
);

export default AppBar;
