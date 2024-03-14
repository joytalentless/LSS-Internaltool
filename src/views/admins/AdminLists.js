import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    OutlinedInput,
    CardContent,
    Select,
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
    Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import axios from 'utils/axios';
import Avatar from 'ui-component/extended/Avatar';
import ChangePwdModal from 'ui-component/ChangePwdModal';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

// assets
import { IconSearch } from '@tabler/icons';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';

import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';
import useAuth from 'hooks/useAuth';

const avatarImage = require.context('assets/images/users', true);

// table header options
const headCells = [
    {
        id: 'name',
        numeric: false,
        label: 'User Profile',
        align: 'center'
    },
    {
        id: 'signup_ip',
        numeric: false,
        label: 'Signed up IP',
        align: 'left'
    },
    {
        id: 'signup_at',
        numeric: false,
        label: 'Fist Login time',
        align: 'left'
    },
    {
        id: 'last_login_ip',
        numeric: false,
        label: 'Last Login IP',
        align: 'left'
    },
    {
        id: 'last_login',
        numeric: false,
        label: 'Last Login time',
        align: 'left'
    },
    {
        id: 'is_superuser',
        numeric: true,
        label: 'Role',
        align: 'center'
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
    const { user } = useAuth();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = React.useState(false);
    const [page, setPage] = React.useState(0);
    const [rows, setRows] = React.useState([]);
    const [admin, setAdmin] = React.useState({});
    const [search, setSearch] = React.useState('');
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('modified_at');
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [totalCount, setTotalCount] = React.useState(0);
    const [openChangePwdModal, setOpenChangePwdModal] = React.useState(false);
    const [roleList, setRoleList] = React.useState([]);

    useEffect(() => {
        // eslint-disable-next-line no-inner-declarations
        async function fetchRoleDetail() {
            try {
                const response = await axios.get(`/roles`);
                const roles = response.data.map((item) => ({
                    name: item.name,
                    description: item.description,
                    id: item.id
                }));
                setRoleList(roles);
            } catch (err) {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: err.error,
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            }
        }
        fetchRoleDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                        is_active: true,
                        user_type: 'staff',
                        search: searchKeyWord
                    }
                })
                .then((resData) => {
                    setTotalCount(resData.data.count);
                    setRows(resData.data.results);
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
        [page, orderBy, order, rowsPerPage]
    );

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

    const showChangePwdModal = (rowData) => {
        if (Object.keys(rowData).length > 0) {
            setAdmin({
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

    const handleDeleteUser = async (row) => {
        axios
            .delete(`/users/${row.id}/`)
            .then(() => {
                fetchUserData(search);
            })
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

    const handleSuperUser = async (row) => {
        axios
            .put(`/users/${row.id}/`, { is_superuser: !row.is_superuser })
            .then(() => fetchUserData(search))
            .catch(() => {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'User approve is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            });
    };

    const handleUserRole = async (newRole, userId) => {
        try {
            await axios.put(`/users/${userId}/`, { role: newRole });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'User role updated successfully!',
                    variant: 'alert'
                })
            );
            const newRows = rows.map((item) => {
                if (item.id === userId) {
                    item.role.id = newRole;
                }
                return item;
            });
            setRows(newRows);
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'User role update failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };
    // ---------------------------- User controll action end ---------------------------- //

    useEffect(() => {
        fetchUserData(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchUserData]);

    return (
        <MainCard title="User List" content={false}>
            {user && user.role && user.role.name === 'super_user' ? (
                <>
                    <CardContent>
                        <Grid container alignItems="center" justifyContent="space-between" spacing={gridSpacing}>
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
                    <TableContainer>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table>
                                <ChangePwdModal
                                    openModal={openChangePwdModal}
                                    user={admin}
                                    handleClose={closeChangePwdModal}
                                    openSuccess={openSuccess}
                                />
                                <EnhancedTableHead theme={theme} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                {/* table content */}
                                <TableBody>
                                    {rows.map((row, index) => {
                                        /** Make sure no display bugs if row isn't an OrderData object */
                                        if (typeof row === 'number') return null;

                                        return (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                {/* <TableCell sx={{ pl: 3 }}>{index + 1}</TableCell> */}
                                                <TableCell sx={{ pl: 3 }}>{row.id}</TableCell>
                                                <TableCell sx={{ width: '200px' }}>
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item>
                                                            <Avatar
                                                                alt={row.name}
                                                                src={row.avatar_url || avatarImage('./default_user.png')}
                                                            />
                                                        </Grid>
                                                        <Grid item xs zeroMinWidth>
                                                            <Typography align="left" variant="subtitle1" component="div">
                                                                {row.username ? row.username : ''}
                                                                {row.role && row.role.name === 'super_user' && (
                                                                    <Tooltip placement="right" title="Super Admin">
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
                                                <TableCell sx={{ textAlign: 'center', width: '140px' }}>
                                                    {row.signup_ip}
                                                    <br />
                                                    {row.signup_location && ` (${row.signup_location})`}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '160px' }}>
                                                    {new Date(row.first_signin_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '140px' }}>
                                                    {row.last_signin_ip}
                                                    <br />
                                                    {row.last_login_location && ` (${row.last_login_location})`}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '160px' }}>
                                                    {new Date(row.last_signin_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center', width: '140px' }}>
                                                    {user.id === row.id ? (
                                                        <Typography align="center" variant="subtitle1" noWrap>
                                                            {row.role.description}
                                                        </Typography>
                                                    ) : (
                                                        <CustomSelect
                                                            roleList={roleList}
                                                            defaultRole={row.role.id}
                                                            onUpdate={(newRole) => {
                                                                handleUserRole(newRole, row.id);
                                                            }}
                                                        />
                                                    )}
                                                </TableCell>
                                                <TableCell align="center" sx={{ pr: 3 }}>
                                                    {row.is_superuser ? (
                                                        <Stack direction="row" justifyContent="center" alignItems="center">
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
                                                            <Tooltip placement="top" title="Delete">
                                                                <span>
                                                                    <IconButton
                                                                        color="error"
                                                                        size="large"
                                                                        disabled={row.id === user.id}
                                                                        onClick={() => handleDeleteUser(row)}
                                                                    >
                                                                        <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                                    </IconButton>
                                                                </span>
                                                            </Tooltip>
                                                        </Stack>
                                                    ) : (
                                                        <Tooltip placement="top" title="Approve">
                                                            <span>
                                                                <IconButton
                                                                    color="success"
                                                                    size="large"
                                                                    disabled={row.id === user.id}
                                                                    onClick={() => handleSuperUser(row)}
                                                                >
                                                                    <CheckCircleIcon sx={{ fontSize: '1.1rem' }} />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
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

export default ConsumerLists;

const CustomSelect = ({ roleList, defaultRole, onUpdate }) => {
    const [role, setRole] = React.useState(-1);

    return (
        <Select
            fullWidth
            size="small"
            id="userRole"
            name="userRole"
            placeholder="Role"
            value={defaultRole}
            onChange={(e) => {
                onUpdate(e.target.value);
            }}
        >
            {roleList.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                    {item.description}
                </MenuItem>
            ))}
        </Select>
    );
};

CustomSelect.propTypes = {
    roleList: PropTypes.array.isRequired,
    defaultRole: PropTypes.number.isRequired,
    onUpdate: PropTypes.func.isRequired
};
