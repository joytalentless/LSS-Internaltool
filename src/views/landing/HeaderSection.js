// material-ui
import { Container, Grid } from '@mui/material';

import mark from 'assets/images/landing/mark.svg';
import back from 'assets/images/landing/back.svg';

// ==============================|| LANDING - HEADER PAGE ||============================== //

const HeaderSection = () => (
    <Container
        sx={{
            height: '100vh',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }}
    >
        <Grid item xs={12} md={7} sx={{ position: 'relative', display: { xs: 'none', md: 'flex' } }}>
            <img src={mark} alt="background" />
            <Grid item xs={12} md={7} sx={{ position: 'absolute', top: '312px', display: { xs: 'none', md: 'flex' } }}>
                <img src={back} alt="background" width="1400px" />
            </Grid>
        </Grid>
    </Container>
);
export default HeaderSection;
