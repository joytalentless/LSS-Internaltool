import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Chip,
    Grid,
    CardContent,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemSecondaryAction,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
    Typography
} from '@mui/material';

// project imports
import axios from 'utils/axios';
import Avatar from 'ui-component/extended/Avatar';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';
import FollowModal from 'ui-component/FollowModal';

// assets
import MailTwoToneIcon from '@mui/icons-material/MailTwoTone';
import PhonelinkRingTwoToneIcon from '@mui/icons-material/PhonelinkRingTwoTone';
import PinDropTwoToneIcon from '@mui/icons-material/PinDropTwoTone';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';
import useAuth from 'hooks/useAuth';

// ==============================|| USER LIST ||============================== //

const ConsumerDetails = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const dispatch = useDispatch();
    const location = useLocation();
    const [currentUserId, setCurrentUserId] = React.useState('0');
    const [currentUserInfo, setCurrentUserInfo] = React.useState(null);
    const [likesCount, setLikesCount] = React.useState(0);
    const [followersCount, setFollowersCount] = React.useState(0);
    const [followeesCount, setFolloweesCount] = React.useState(0);
    const [currentUserAddress, setCurrentUserAddress] = React.useState(null);
    const [isOpenDialog, setIsOpenDialog] = React.useState(false);
    const [type, setType] = React.useState('');

    const fetchUserData = (userId) => {
        axios
            .get(`/users/${userId}`)
            .then((resData) => {
                setCurrentUserInfo(resData.data);
                const defaultAddress = resData.data.addresses.filter((address) => address.is_default === true);
                setCurrentUserAddress(defaultAddress[0]);
            })
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Fetch is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });

        // Get Likes count
        axios
            .get('/users/like/products', {
                params: {
                    user_id: userId,
                    p: 1,
                    page_size: 10
                }
            })
            .then((resData) => {
                setLikesCount(resData.data.count);
            })
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Fetch is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });

        // Get Followers count
        axios
            .get('/users/followers', {
                params: {
                    user_id: userId,
                    is_active: true,
                    is_accepted: true,
                    p: 1,
                    page_size: 10
                }
            })
            .then((resData) => {
                setFollowersCount(resData.data.count);
            })
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Fetch is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });

        // Get Followees count
        axios
            .get('/users/followees', {
                params: {
                    user_id: userId,
                    is_active: true,
                    is_accepted: true,
                    p: 1,
                    page_size: 10
                }
            })
            .then((resData) => {
                setFolloweesCount(resData.data.count);
            })
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Fetch is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        fetchUserData(searchParams.get('user_id'));
        setCurrentUserId(searchParams.get('user_id'));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    const handleOpenDialog = () => {
        setIsOpenDialog(!isOpenDialog);
    };

    return (
        <MainCard title="User Profile" content={false} sx={{ overflow: 'visible' }}>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <Grid container spacing={gridSpacing} sx={{ padding: '16px' }}>
                    <Grid item lg={4} xs={12}>
                        <SubCard
                            title={
                                <Grid container spacing={2} alignItems="center">
                                    <Grid item>
                                        <Box
                                            sx={{
                                                transition: 'transform 0.3s ease-in-out',
                                                overflow: 'hidden',
                                                '&:hover': {
                                                    transform: 'scale(6) translateX(31px)'
                                                }
                                            }}
                                        >
                                            <Avatar alt="User 1" src={currentUserInfo?.avatar_url} size="lg" />
                                        </Box>
                                    </Grid>
                                    <Grid item xs zeroMinWidth>
                                        <Typography align="left" variant="subtitle1">
                                            {currentUserInfo?.username ? currentUserInfo?.username : 'N/A'}
                                        </Typography>
                                    </Grid>
                                    <Grid item>
                                        {currentUserInfo?.auth_status === 0 && (
                                            <Chip
                                                label="Registered"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.grey.light,
                                                    color: theme.palette.grey.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 1 && (
                                            <Chip
                                                label="Mail Verified"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.warning.main + 80,
                                                    color: theme.palette.warning.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 2 && (
                                            <Chip
                                                label="Profile Completed"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.success.light + 60,
                                                    color: theme.palette.success.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 3 && (
                                            <Chip
                                                label="ID Verified"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.success.light + 60,
                                                    color: theme.palette.success.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 4 && (
                                            <Chip
                                                label="Ready for review"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.success.dark + 60,
                                                    color: theme.palette.success.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 5 && (
                                            <Chip
                                                label="Await review"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.warning.dark,
                                                    color: 'white'
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 6 && (
                                            <Chip
                                                label="Rejected"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.warning.light + 80,
                                                    color: theme.palette.warning.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 7 && (
                                            <Chip
                                                label="Approved & sent invite"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.secondary.light + 80,
                                                    color: theme.palette.secondary.dark
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 8 && (
                                            <Chip
                                                label="Unubscribed"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.warning.dark,
                                                    color: 'white'
                                                }}
                                            />
                                        )}
                                        {currentUserInfo?.auth_status === 9 && (
                                            <Chip
                                                label="Subscribed"
                                                size="small"
                                                sx={{
                                                    background: theme.palette.success.dark,
                                                    color: 'white'
                                                }}
                                            />
                                        )}
                                    </Grid>
                                </Grid>
                            }
                            sx={{ overflow: 'visible' }}
                        >
                            <List component="nav" aria-label="main mailbox folders" sx={{ zIndex: 0 }}>
                                <ListItemButton>
                                    <ListItemIcon>
                                        <MailTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={<Typography variant="subtitle1">Email</Typography>} />
                                    <ListItemSecondaryAction>
                                        <Typography variant="subtitle2" align="right">
                                            {currentUserInfo?.email ? currentUserInfo?.email : 'N/A'}
                                        </Typography>
                                    </ListItemSecondaryAction>
                                </ListItemButton>
                                <Divider />
                                <ListItemButton>
                                    <ListItemIcon>
                                        <PhonelinkRingTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={<Typography variant="subtitle1">Phone</Typography>} />
                                    <ListItemSecondaryAction>
                                        <Typography variant="subtitle2" align="right">
                                            {currentUserInfo?.phone ? currentUserInfo?.phone : 'N/A'}
                                        </Typography>
                                    </ListItemSecondaryAction>
                                </ListItemButton>
                                <Divider />
                                <ListItemButton>
                                    <ListItemIcon>
                                        <PinDropTwoToneIcon sx={{ fontSize: '1.3rem' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={<Typography variant="subtitle1">Zip</Typography>} />
                                    <ListItemSecondaryAction>
                                        <Typography variant="subtitle2" align="right">
                                            {currentUserAddress ? currentUserAddress?.zip : 'N/A'}
                                        </Typography>
                                    </ListItemSecondaryAction>
                                </ListItemButton>
                            </List>
                            <CardContent>
                                <Grid container spacing={0}>
                                    <Grid item xs={4}>
                                        <Typography align="center" variant="h3">
                                            {likesCount}
                                        </Typography>
                                        <Typography
                                            align="center"
                                            variant="subtitle2"
                                            sx={{
                                                cursor: 'pointer',
                                                borderBottom: '1px solid transparent',
                                                '&:hover': {
                                                    borderBottom: '1px solid black'
                                                }
                                            }}
                                            onClick={() => {
                                                setType('Likes');
                                                handleOpenDialog();
                                            }}
                                        >
                                            Likes
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography align="center" variant="h3">
                                            {followersCount}
                                        </Typography>
                                        <Typography
                                            align="center"
                                            variant="subtitle2"
                                            sx={{
                                                cursor: 'pointer',
                                                borderBottom: '1px solid transparent',
                                                '&:hover': {
                                                    borderBottom: '1px solid black'
                                                }
                                            }}
                                            onClick={() => {
                                                setType('Followers');
                                                handleOpenDialog();
                                            }}
                                        >
                                            Followers
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={4}>
                                        <Typography align="center" variant="h3">
                                            {followeesCount}
                                        </Typography>
                                        <Typography
                                            align="center"
                                            variant="subtitle2"
                                            sx={{
                                                cursor: 'pointer',
                                                borderBottom: '1px solid transparent',
                                                '&:hover': {
                                                    borderBottom: '1px solid black'
                                                }
                                            }}
                                            onClick={() => {
                                                setType('Following');
                                                handleOpenDialog();
                                            }}
                                        >
                                            Following
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </SubCard>
                    </Grid>
                    <Grid item lg={8} xs={12}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item xs={12}>
                                <SubCard title="About me">
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="body2">
                                                {currentUserInfo?.bio_text ? currentUserInfo?.bio_text : 'No bio text for this user...'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="subtitle1">Personal Details</Typography>
                                        </Grid>
                                        <Divider sx={{ pt: 1 }} />
                                        <Grid item xs={12}>
                                            <TableContainer>
                                                <Table
                                                    sx={{
                                                        '& td': {
                                                            borderBottom: 'none'
                                                        }
                                                    }}
                                                    size="small"
                                                >
                                                    <TableBody>
                                                        <TableRow key="username">
                                                            <TableCell variant="head">Full Name</TableCell>
                                                            <TableCell>:</TableCell>
                                                            <TableCell>
                                                                {currentUserInfo?.username ? currentUserInfo?.username : 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow key="birthday">
                                                            <TableCell variant="head">Birthday</TableCell>
                                                            <TableCell>:</TableCell>
                                                            <TableCell>
                                                                {currentUserInfo?.birthday ? currentUserInfo?.birthday : 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow key="privacy">
                                                            <TableCell variant="head">Privacy</TableCell>
                                                            <TableCell>:</TableCell>
                                                            <TableCell>{currentUserInfo?.is_private ? 'Private' : 'Public'}</TableCell>
                                                        </TableRow>
                                                        <TableRow key="first_signin_at">
                                                            <TableCell variant="head">Member since</TableCell>
                                                            <TableCell>:</TableCell>
                                                            <TableCell>
                                                                {currentUserInfo?.first_signin_at
                                                                    ? new Date(currentUserInfo?.first_signin_at).toLocaleString()
                                                                    : 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow key="tiktok">
                                                            <TableCell variant="head">Tiktok or Instagram</TableCell>
                                                            <TableCell>:</TableCell>
                                                            <TableCell>
                                                                {currentUserInfo?.tiktok ? currentUserInfo?.tiktok : 'N/A'}
                                                            </TableCell>
                                                        </TableRow>
                                                        <TableRow key="wiki">
                                                            <TableCell variant="head">Wikipedia or LinkedIn</TableCell>
                                                            <TableCell>:</TableCell>
                                                            <TableCell>{currentUserInfo?.wiki ? currentUserInfo?.wiki : 'N/A'}</TableCell>
                                                        </TableRow>
                                                    </TableBody>
                                                </Table>
                                            </TableContainer>
                                        </Grid>
                                    </Grid>
                                </SubCard>
                            </Grid>
                        </Grid>
                    </Grid>
                </Grid>
            ) : (
                <CardContent>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Typography color="inherit" variant="subtitle1">
                            You are not allowed to navigate this page
                        </Typography>
                    </Grid>
                </CardContent>
            )}
            <FollowModal
                type={type}
                openModal={isOpenDialog}
                handleOpenDialog={handleOpenDialog}
                userId={currentUserId}
                userName={currentUserInfo?.username}
                // eslint-disable-next-line no-nested-ternary
                totalCount={type === 'Likes' ? likesCount : type === 'Following' ? followeesCount : followersCount}
            />
        </MainCard>
    );
};

export default ConsumerDetails;
