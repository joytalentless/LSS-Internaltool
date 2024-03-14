import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import { Avatar, Button, Divider, Grid, IconButton, Modal, Typography } from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import GppBadIcon from '@mui/icons-material/GppBad';
import ChatBubbleTwoToneIcon from '@mui/icons-material/ChatBubbleTwoTone';
import NotInterestedTwoToneIcon from '@mui/icons-material/NotInterestedTwoTone';
import HighlightOffTwoToneIcon from '@mui/icons-material/HighlightOffTwoTone';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import LockClockIcon from '@mui/icons-material/LockClock';
import PaidIcon from '@mui/icons-material/Paid';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import PinDropTwoToneIcon from '@mui/icons-material/PinDropTwoTone';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// ==============================|| MODAL ||============================== //

function DetailModal({ openModal, handleClose, user, handleUserActivate, handleUserVIP }) {
    const [userData, setUserData] = useState(user);
    const avatarProfile = userData.avatar_url;

    useEffect(() => {
        setUserData(user);
    }, [user]);

    const changeState = () => {
        setUserData({ ...userData, is_active: !userData.is_active });
        handleUserActivate(userData);
    };
    const changeState2 = () => {
        setUserData({ ...userData, is_vip: !userData.is_vip });
        handleUserVIP(userData);
    };

    return (
        // <Grid container justifyContent="flex-end">
        <Modal open={openModal} onClose={handleClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
            <div tabIndex={-1}>
                <MainCard
                    // style={modalStyle}
                    sx={{
                        position: 'absolute',
                        width: { xs: 280, lg: 450 },
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <Grid container alignItems="center" spacing={1}>
                                <Grid item>
                                    <Avatar alt={userData.name} src={avatarProfile} sx={{ width: 64, height: 64 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Grid container spacing={0.5}>
                                        <Grid item xs={12}>
                                            <Typography variant="h5" component="div" sx={{ fontSize: '1rem' }}>
                                                {userData.name} ({userData.username})
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">{userData.email}</Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                                <Grid item>
                                    <IconButton size="large" onClick={handleClose}>
                                        <HighlightOffTwoToneIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item xs={4}>
                                    <Button variant="outlined" fullWidth startIcon={<ChatBubbleTwoToneIcon />}>
                                        Edit
                                    </Button>
                                </Grid>
                                <Grid item xs={4}>
                                    {userData.is_active ? (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            fullWidth
                                            startIcon={<NotInterestedTwoToneIcon />}
                                            onClick={changeState}
                                        >
                                            Block
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            fullWidth
                                            startIcon={<CheckCircleOutlineIcon />}
                                            onClick={changeState}
                                        >
                                            Active
                                        </Button>
                                    )}
                                </Grid>
                                <Grid item xs={4}>
                                    {userData.is_vip ? (
                                        <Button
                                            variant="outlined"
                                            color="secondary"
                                            fullWidth
                                            startIcon={<GppBadIcon />}
                                            onClick={changeState2}
                                        >
                                            Unverify
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="outlined"
                                            color="success"
                                            fullWidth
                                            startIcon={<VerifiedUserIcon />}
                                            onClick={changeState2}
                                        >
                                            Verify
                                        </Button>
                                    )}
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <PinDropTwoToneIcon sx={{ verticalAlign: 'sub', fontSize: '1.125rem', mr: 0.625 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Typography variant="body2" sx={{ mb: 0.625 }}>
                                        Signed Up IP Address{' '}
                                        <Typography component="span" color="primary">
                                            (Country)
                                        </Typography>
                                    </Typography>
                                    <Typography variant="body2">
                                        {userData.signup_IP}{' '}
                                        <Typography component="span" color="secondary">
                                            ({userData.signup_location})
                                        </Typography>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <AccessTimeIcon sx={{ verticalAlign: 'sub', fontSize: '1.125rem', mr: 0.625 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Typography variant="body2" sx={{ mb: 0.625 }}>
                                        Fist Login Time{' '}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.625 }}>
                                        {userData.first_login_date_time}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <VpnKeyIcon sx={{ verticalAlign: 'sub', fontSize: '1.125rem', mr: 0.625 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Typography variant="body2">Last Login IP Address (Country)</Typography>
                                    <Typography variant="body2">
                                        {userData.last_login_IP}{' '}
                                        <Typography component="span" color="secondary">
                                            ({userData.last_login_location})
                                        </Typography>
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <LockClockIcon sx={{ verticalAlign: 'sub', fontSize: '1.125rem', mr: 0.625 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Typography variant="body2" sx={{ mb: 0.625 }}>
                                        Last Login Time{' '}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 0.625 }}>
                                        {new Date(userData.last_login).toLocaleString()}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <PaidIcon sx={{ verticalAlign: 'sub', fontSize: '1.125rem', mr: 0.625 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Typography variant="body2" sx={{ mb: 0.625 }}>
                                        Total Spent
                                    </Typography>
                                    <Typography variant="body2">${userData.total_spent}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={1}>
                                <Grid item>
                                    <LocalMallIcon sx={{ verticalAlign: 'sub', fontSize: '1.125rem', mr: 0.625 }} />
                                </Grid>
                                <Grid item xs zeroMinWidth>
                                    <Typography variant="body2">Number of Orders</Typography>
                                    <Typography variant="body2">{userData.order_count}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                            <Button type="button" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button variant="contained" type="button">
                                OK
                            </Button>
                        </Grid>
                    </Grid>
                </MainCard>
            </div>
        </Modal>
        // </Grid>
    );
}

DetailModal.propTypes = {
    openModal: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    user: PropTypes.any.isRequired,
    handleUserActivate: PropTypes.func.isRequired,
    handleUserVIP: PropTypes.func.isRequired
};

export default DetailModal;
