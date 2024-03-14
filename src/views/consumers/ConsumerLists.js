import PropTypes from 'prop-types';
import React, { useEffect, useCallback } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Checkbox,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    FormControlLabel,
    OutlinedInput,
    CardContent,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableSortLabel,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    MenuItem,
    Select
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import axios from 'utils/axios';
import Avatar from 'ui-component/extended/Avatar';
import DetailModal from 'ui-component/DetailModal';
import ChangePwdModal from 'ui-component/ChangePwdModal';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

// assets
import { IconSearch } from '@tabler/icons';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import BlockTwoToneIcon from '@mui/icons-material/BlockTwoTone';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GppBadIcon from '@mui/icons-material/GppBad';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';

import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';
import useAuth from 'hooks/useAuth';

const avatarImage = require.context('assets/images/users', true);

const AUTH_STATUS_LIST = [
    {
        id: 1,
        name: 'Registered'
    },
    {
        id: 2,
        name: 'Mail Verified'
    },
    {
        id: 3,
        name: 'Profile Completed'
    },
    {
        id: 4,
        name: 'ID Verified'
    },
    {
        id: 5,
        name: 'Ready for review'
    },
    {
        id: 6,
        name: 'Await review'
    },
    {
        id: 7,
        name: 'Rejected'
    },
    {
        id: 8,
        name: 'Approved & sent invite'
    },
    {
        id: 9,
        name: 'Unubscribed'
    },
    {
        id: 10,
        name: 'Subscribed'
    }
];

// table sort
function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

const getComparator = (order, orderBy) =>
    order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);

function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
}

// table header options
const headCells = [
    {
        id: 'name',
        numeric: false,
        label: 'User Profile',
        align: 'left'
    },
    // {
    //     id: 'first_signin_at',
    //     numeric: false,
    //     label: 'First Login time',
    //     align: 'left'
    // },
    {
        id: 'auth_status',
        numeric: false,
        label: 'Auth status',
        align: 'left'
    },
    {
        id: 'last_signin_ip',
        numeric: false,
        label: 'Last Login IP',
        align: 'left'
    },
    {
        id: 'last_signin_at',
        numeric: false,
        label: 'Last Login Time',
        align: 'left'
    },
    {
        id: 'last_signin_device',
        numeric: false,
        label: 'Last Device',
        align: 'left'
    },
    {
        id: 'total_spent',
        numeric: true,
        label: 'Total Spent',
        align: 'left'
    },
    {
        id: 'order_count',
        numeric: true,
        label: 'Orders',
        align: 'left'
    },
    {
        id: 'is_vip',
        numeric: true,
        label: 'VIP',
        align: 'left'
    },
    {
        id: 'is_approved',
        numeric: true,
        label: 'Status',
        align: 'left'
    },
    {
        id: 'is_active',
        numeric: false,
        label: 'Active Status',
        align: 'left'
    }
];

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell sx={{ pl: 3 }}>Id</TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Action
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    order: PropTypes.string.isRequired,
    orderBy: PropTypes.string.isRequired,
    onRequestSort: PropTypes.func.isRequired
};

// ==============================|| USER LIST ||============================== //

const ConsumerLists = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const dispatch = useDispatch();

    const previousRadio = React.useRef(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [rows, setRows] = React.useState([]);
    const [user, setUser] = React.useState({});
    const [search, setSearch] = React.useState('');
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('modified_at');
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [consumerList, setConsumerList] = React.useState([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [radioFilterValue, setRadioFilterValue] = React.useState('4');
    const [openDetailModal, setOpenDetailModal] = React.useState(false);
    const [openChangePwdModal, setOpenChangePwdModal] = React.useState(false);
    const [searchUserAuthStatus, setSearchUserAuthStatus] = React.useState(0);

    const userAuthTypes = [
        { value: 0, label: 'All Users' },
        { value: 1, label: 'Active Subscribers' },
        { value: 2, label: 'Deactive Users' },
        { value: 3, label: 'Active Unsubscribers' }
    ];

    useEffect(() => {
        previousRadio.current = radioFilterValue;
    }, [radioFilterValue]);

    const fetchUserData = useCallback(
        (searchKeyWord) => {
            setIsLoading(true);
            axios
                .get('/users/', {
                    params: {
                        p: page + 1,
                        order_by: orderBy,
                        desc: order !== 'asc',
                        page_size: rowsPerPage,
                        user_type: 'general',
                        search: searchKeyWord,
                        is_active: searchUserAuthStatus === 0 ? 'all' : searchUserAuthStatus === 1 || searchUserAuthStatus === 3,
                        // eslint-disable-next-line no-nested-ternary
                        auth_status: searchUserAuthStatus === 1 ? 9 : searchUserAuthStatus === 3 ? 8 : 'all'
                    }
                })
                .then((resData) => {
                    setTotalCount(resData.data.count);
                    setConsumerList(resData.data.results);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
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
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [page, orderBy, order, rowsPerPage, radioFilterValue, searchUserAuthStatus]
    );

    const handleModalClose = () => {
        setOpenDetailModal(false);
    };

    const showChangePwdModal = (rowData) => {
        if (Object.keys(rowData).length > 0) {
            setUser({
                ...rowData
            });
            setOpenChangePwdModal(true);
        }
    };

    const closeChangePwdModal = () => {
        setOpenChangePwdModal(false);
    };

    const openSuccess = () => {
        dispatch(
            openSnackbar({
                open: true,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                message: 'Password is successfully changed!',
                variant: 'alert',
                alert: {
                    color: 'success'
                }
            })
        );
    };

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event?.target.value, 10));
        setPage(0);
    };

    // ---------------------------- User controll action start ---------------------------- //
    const handleDeleteUser = async (row) => {
        axios
            .delete(`/users/${row.id}/`)
            .then(() => fetchUserData(search))
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Delete is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };

    const handleUserActivate = async (row) => {
        axios
            .put(`/users/${row.id}/`, { is_active: !row.is_active })
            .then(() => {
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'User activation/deactivation is successful!',
                    variant: 'alert',
                    alert: {
                        color: 'success'
                    }
                });
                const newRows = rows.map((ele) => {
                    if (ele.id === row.id) return { ...ele, is_active: !row.is_active };
                    return ele;
                });
                setRows(newRows);
            })
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'User activating is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };

    const handleUserReject = async (row) => {
        axios
            .put(`/users/${row.id}/`, { auth_status: 6 })
            .then(() => fetchUserData(search))
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'User rejecting is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };

    const handleUserAccept = async (row) => {
        axios
            .put(`/users/${row.id}/`, { auth_status: 7 })
            .then(() => fetchUserData(search))
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'User accepting is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };

    const handleChangeAuthStatus = async (row, authStatus) => {
        try {
            await axios.put(`/users/${row.id}/`, { auth_status: authStatus });
            fetchUserData(search);
        } catch (e) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'User auth status changing is failed!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const handleUserVIP = async (row) => {
        axios
            .put(`/users/${row.id}/`, { is_vip: !row.is_vip })
            .then(() => fetchUserData(search))
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'User verify is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };
    // ---------------------------- User controll action end ---------------------------- //

    useEffect(() => {
        fetchUserData(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchUserData]);

    useEffect(() => {
        const radioFilter = previousRadio.current ? previousRadio.current : radioFilterValue;
        setRows(consumerList);
        setRadioFilterValue(radioFilter);
        // eslint-disable-next-line
    }, [consumerList]);

    return (
        <MainCard title="User List" content={false} sx={{ overflow: 'visible' }}>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <CardContent>
                        <Grid container alignItems="center" justifyContent="space-between" spacing={gridSpacing}>
                            <Grid item xs={6} sm={2}>
                                <Select
                                    size="small"
                                    fullWidth
                                    placeholder="UserAuthType"
                                    value={searchUserAuthStatus}
                                    onChange={(e) => {
                                        setSearchUserAuthStatus(e.target.value);
                                        setPage(0);
                                    }}
                                >
                                    {userAuthTypes.map((category, index) => (
                                        <MenuItem key={index} value={category.value}>
                                            {category.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>
                            <Grid item>
                                <OutlinedInput
                                    id="input-search-list-style1"
                                    placeholder="Search"
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <IconSearch stroke={1.5} size="16px" />
                                        </InputAdornment>
                                    }
                                    size="small"
                                    onChange={handleSearch}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') fetchUserData(search);
                                    }}
                                    value={search}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <TableContainer sx={{ overflow: 'visible' }}>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table>
                                <DetailModal
                                    openModal={openDetailModal}
                                    user={user}
                                    handleClose={handleModalClose}
                                    handleUserActivate={handleUserActivate}
                                    handleUserVIP={handleUserVIP}
                                />
                                <ChangePwdModal
                                    openModal={openChangePwdModal}
                                    user={user}
                                    handleClose={closeChangePwdModal}
                                    openSuccess={openSuccess}
                                />
                                <EnhancedTableHead theme={theme} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                {/* table content */}
                                <TableBody sx={{ overflow: 'visible' }}>
                                    {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                                        /** Make sure no display bugs if row isn't an OrderData object */
                                        if (typeof row === 'number') return null;

                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                {/* <TableCell sx={{ pl: 3 }}>{index + 1}</TableCell> */}
                                                <TableCell sx={{ pl: 3 }}>
                                                    <Link href={`/user/detail?user_id=${row.id}`} underline="hover">
                                                        {row.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ width: '200px' }}>
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item>
                                                            <Link href={`/user/detail?user_id=${row.id}`} underline="hover">
                                                                <Box
                                                                    sx={{
                                                                        border: '1px solid lightgrey',
                                                                        borderRadius: '50%',
                                                                        transition: 'transform 0.3s ease-in-out',
                                                                        overflow: 'hidden',
                                                                        zIndex: 9,
                                                                        '&:hover': {
                                                                            border: '0.5px solid lightgrey',
                                                                            transform: 'scale(5)',
                                                                            zIndex: 9999
                                                                        }
                                                                    }}
                                                                >
                                                                    <Avatar
                                                                        alt={row.name}
                                                                        src={row.avatar_url || avatarImage('./default_user.png')}
                                                                    />
                                                                </Box>
                                                            </Link>
                                                        </Grid>
                                                        <Grid item xs zeroMinWidth>
                                                            <Typography align="left" variant="subtitle1" component="div">
                                                                <Link href={`/user/detail?user_id=${row.id}`} underline="hover">
                                                                    {row.username ? row.username : ''}
                                                                </Link>
                                                                {row.auth_status > 4 && row.is_vip && row.is_active && (
                                                                    <Tooltip placement="right" title="VIP">
                                                                        <CheckCircleIcon
                                                                            sx={{
                                                                                color: 'success.dark',
                                                                                width: 14,
                                                                                height: 14,
                                                                                paddingLeft: '1px',
                                                                                verticalAlign: 'middle'
                                                                            }}
                                                                        />
                                                                    </Tooltip>
                                                                )}
                                                            </Typography>
                                                            <Tooltip placement="top" title={row.email}>
                                                                <Typography align="left" variant="subtitle2" noWrap>
                                                                    {row.email}
                                                                </Typography>
                                                            </Tooltip>
                                                        </Grid>
                                                    </Grid>
                                                </TableCell>
                                                {/* <TableCell sx={{ textAlign: 'center', width: '160px' }}>
                                                    {new Date(row.first_signin_at).toLocaleString()}
                                                </TableCell> */}
                                                <TableCell sx={{ textAlign: 'center', width: '160px' }}>
                                                    <CustomSelect
                                                        defaultAuthStatus={row.auth_status}
                                                        onUpdate={(authStatus) => {
                                                            handleChangeAuthStatus(row, authStatus);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '140px' }}>
                                                    {row.last_signin_ip}
                                                    <br />
                                                    {row.last_login_location && ` (${row.last_login_location})`}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '160px' }}>
                                                    {new Date(row.last_signin_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '160px' }}>{row.last_signin_device}</TableCell>
                                                <TableCell sx={{ width: '130px' }}>{row.total_spent && `$${row.total_spent}`}</TableCell>
                                                <TableCell>{row.order_count}</TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '140px' }}>
                                                    {row.is_vip === true ? (
                                                        <Chip
                                                            label="Yes"
                                                            size="small"
                                                            sx={{
                                                                background:
                                                                    theme.palette.mode === 'dark'
                                                                        ? theme.palette.dark.main
                                                                        : theme.palette.success.light + 80,
                                                                color: theme.palette.success.dark
                                                            }}
                                                        />
                                                    ) : (
                                                        <Chip
                                                            label="No"
                                                            size="small"
                                                            sx={{
                                                                background:
                                                                    theme.palette.mode === 'dark'
                                                                        ? theme.palette.dark.main
                                                                        : theme.palette.orange.light + 80,
                                                                color: theme.palette.orange.dark
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '80px' }}>
                                                    {row.auth_status === 0 && (
                                                        <Chip
                                                            label="Registered"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.grey.light,
                                                                color: theme.palette.grey.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 1 && (
                                                        <Chip
                                                            label="Mail Verified"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.warning.main + 80,
                                                                color: theme.palette.warning.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 2 && (
                                                        <Chip
                                                            label="Profile Completed"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.success.light + 60,
                                                                color: theme.palette.success.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 3 && (
                                                        <Chip
                                                            label="ID Verified"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.success.light + 60,
                                                                color: theme.palette.success.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 4 && (
                                                        <Chip
                                                            label="Ready for review"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.success.dark + 60,
                                                                color: theme.palette.success.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 5 && (
                                                        <Chip
                                                            label="Await review"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.warning.dark,
                                                                color: 'white'
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 6 && (
                                                        <Chip
                                                            label="Rejected"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.warning.light + 80,
                                                                color: theme.palette.warning.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 7 && (
                                                        <Chip
                                                            label="Approved & sent invite"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.secondary.light + 80,
                                                                color: theme.palette.secondary.dark
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 8 && (
                                                        <Chip
                                                            label="Unubscribed"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.warning.dark,
                                                                color: 'white'
                                                            }}
                                                        />
                                                    )}
                                                    {row.auth_status === 9 && (
                                                        <Chip
                                                            label="Subscribed"
                                                            size="small"
                                                            sx={{
                                                                background: theme.palette.success.dark,
                                                                color: 'white'
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '150px' }}>
                                                    {row.is_active && (
                                                        <Chip
                                                            label="Activated"
                                                            size="small"
                                                            sx={{
                                                                background:
                                                                    theme.palette.mode === 'dark'
                                                                        ? theme.palette.dark.main
                                                                        : theme.palette.success.light + 80,
                                                                color: theme.palette.success.dark
                                                            }}
                                                        />
                                                    )}
                                                    {!row.is_active && (
                                                        <Chip
                                                            label="Deactivated"
                                                            size="small"
                                                            sx={{
                                                                background:
                                                                    theme.palette.mode === 'dark'
                                                                        ? theme.palette.dark.main
                                                                        : theme.palette.grey.light + 80,
                                                                color: theme.palette.grey.dark
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center" sx={{ pr: 3 }}>
                                                    <Stack direction="row" justifyContent="center" alignItems="center">
                                                        {row.is_active ? (
                                                            <Tooltip placement="top" title="Deactive">
                                                                <span>
                                                                    <IconButton
                                                                        color="primary"
                                                                        sx={{
                                                                            color: theme.palette.orange.dark,
                                                                            borderColor: theme.palette.orange.main,
                                                                            '&:hover ': { background: theme.palette.orange.light }
                                                                        }}
                                                                        size="large"
                                                                        onClick={() => handleUserActivate(row)}
                                                                    >
                                                                        <BlockTwoToneIcon sx={{ fontSize: '1.1rem' }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        ) : (
                                                            <Tooltip placement="top" title="Active">
                                                                <span>
                                                                    <IconButton
                                                                        color="primary"
                                                                        aria-label="delete"
                                                                        size="large"
                                                                        onClick={() => handleUserActivate(row)}
                                                                    >
                                                                        <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                        {row.auth_status > 6 && (
                                                            <>
                                                                {row.is_vip ? (
                                                                    <Tooltip placement="top" title="Unset VIP">
                                                                        <span>
                                                                            <IconButton
                                                                                color="primary"
                                                                                sx={{
                                                                                    color: theme.palette.orange.dark,
                                                                                    borderColor: theme.palette.orange.main,
                                                                                    '&:hover ': { background: theme.palette.orange.light }
                                                                                }}
                                                                                size="large"
                                                                                onClick={() => handleUserVIP(row)}
                                                                            >
                                                                                <GppBadIcon sx={{ fontSize: '1.1rem' }} />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                ) : (
                                                                    <Tooltip placement="top" title="Set as VIP">
                                                                        <span>
                                                                            <IconButton
                                                                                color="primary"
                                                                                sx={{
                                                                                    color: theme.palette.success.dark,
                                                                                    borderColor: theme.palette.success.main,
                                                                                    '&:hover ': { background: theme.palette.success.light }
                                                                                }}
                                                                                size="large"
                                                                                onClick={() => handleUserVIP(row)}
                                                                            >
                                                                                <VerifiedUserIcon sx={{ fontSize: '1.1rem' }} />
                                                                            </IconButton>
                                                                        </span>
                                                                    </Tooltip>
                                                                )}
                                                                {/* <Tooltip placement="top" title="Show Details">
                                                                    <span>
                                                                        <IconButton
                                                                            color="primary"
                                                                            sx={{
                                                                                color: theme.palette.primary.dark,
                                                                                borderColor: theme.palette.primary.main,
                                                                                '&:hover ': { background: theme.palette.primary.light }
                                                                            }}
                                                                            size="large"
                                                                            onClick={() => showDetailModal(row)}
                                                                        >
                                                                            <VisibilityIcon sx={{ fontSize: '1.1rem' }} />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip> */}
                                                            </>
                                                        )}
                                                        {row.auth_status === 7 && (
                                                            <Tooltip placement="top" title="Re-send invitation">
                                                                <span>
                                                                    <IconButton
                                                                        color="primary"
                                                                        sx={{
                                                                            color: theme.palette.grey.dark,
                                                                            borderColor: theme.palette.grey.main,
                                                                            '&:hover ': { background: theme.palette.grey.light }
                                                                        }}
                                                                        size="large"
                                                                    >
                                                                        <ForwardToInboxIcon sx={{ fontSize: '1.1rem' }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        )}
                                                        {row.auth_status === 5 ? (
                                                            <>
                                                                <Tooltip placement="top" title="Approve">
                                                                    <span>
                                                                        <IconButton
                                                                            color="primary"
                                                                            aria-label="delete"
                                                                            size="large"
                                                                            onClick={() => handleUserAccept(row)}
                                                                        >
                                                                            <CheckIcon sx={{ fontSize: '1.1rem' }} />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                                <Tooltip placement="top" title="Reject">
                                                                    <span>
                                                                        <IconButton
                                                                            color="primary"
                                                                            sx={{
                                                                                color: theme.palette.orange.dark,
                                                                                borderColor: theme.palette.orange.main,
                                                                                '&:hover ': { background: theme.palette.orange.light }
                                                                            }}
                                                                            size="large"
                                                                            onClick={() => handleUserReject(row)}
                                                                        >
                                                                            <ClearIcon sx={{ fontSize: '1.1rem' }} />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Tooltip placement="top" title="Change Password">
                                                                    <span>
                                                                        <IconButton
                                                                            color="primary"
                                                                            sx={{
                                                                                color: theme.palette.primary.dark,
                                                                                borderColor: theme.palette.primary.main,
                                                                                '&:hover ': { background: theme.palette.primary.light }
                                                                            }}
                                                                            size="large"
                                                                            onClick={() => showChangePwdModal(row)}
                                                                        >
                                                                            <LockResetOutlinedIcon sx={{ fontSize: '1.1rem' }} />
                                                                        </IconButton>
                                                                    </span>
                                                                </Tooltip>
                                                            </>
                                                        )}
                                                        <Tooltip placement="top" title="Delete">
                                                            <span>
                                                                <IconButton
                                                                    color="error"
                                                                    size="large"
                                                                    onClick={() => handleDeleteUser(row)}
                                                                >
                                                                    <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </Stack>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>
                    <Grid item xs={12} sx={{ p: 3 }}>
                        {/* table pagination */}
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25, 50, 100]}
                            component="div"
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Grid>
                </>
            ) : (
                <CardContent>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Typography color="inherit" variant="subtitle1">
                            You are not allowed to navigate this page
                        </Typography>
                    </Grid>
                </CardContent>
            )}
        </MainCard>
    );
};

const CustomSelect = ({ defaultAuthStatus, onUpdate }) => {
    const [authStatusID, setAuthStatusID] = React.useState(defaultAuthStatus + 1);

    useEffect(() => {
        setAuthStatusID(defaultAuthStatus + 1);
    }, [defaultAuthStatus]);

    return (
        <Select
            fullWidth
            size="small"
            id="authStatus"
            name="authStatus"
            placeholder="Auth status"
            value={authStatusID || ''}
            onChange={(e) => {
                setAuthStatusID(e.target.value);
                onUpdate(e.target.value - 1);
            }}
            // disabled={defaultAuthStatus + 1 === AUTH_STATUS_LIST[9].id}
        >
            {AUTH_STATUS_LIST.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                    {item.name}
                </MenuItem>
            ))}
        </Select>
    );
};

CustomSelect.propTypes = {
    defaultAuthStatus: PropTypes.number.isRequired,
    onUpdate: PropTypes.func.isRequired
};

export default ConsumerLists;
