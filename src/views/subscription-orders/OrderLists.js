import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    Link,
    OutlinedInput,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Tooltip,
    Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
// project imports
import MainCard from 'ui-component/cards/MainCard';

// assets
import { IconSearch, IconReceiptRefund } from '@tabler/icons';
import useAuth from 'hooks/useAuth';
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
        id: 'user_id',
        numeric: true,
        label: 'User ID',
        align: 'center'
    },
    {
        id: 'amount_paid',
        numeric: false,
        label: 'Amount Paid',
        align: 'center'
    },
    {
        id: 'status',
        numeric: true,
        label: 'Status',
        align: 'center'
    },
    {
        id: 'created_at',
        numeric: true,
        label: 'Created',
        align: 'center'
    }
];

// ==============================|| TABLE HEADER ||============================== //

// eslint-disable-next-line no-unused-vars
function EnhancedTableHead({ order, orderBy, onRequestSort }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox" align="center" sx={{ pl: 3 }}>
                    <Typography variant="subtitle1" sx={{ color: 'grey.600' }}>
                        #
                    </Typography>
                </TableCell>
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
                    <Typography variant="subtitle1" sx={{ color: 'grey.600' }}>
                        Action
                    </Typography>
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    onRequestSort: PropTypes.func.isRequired
};

// ==============================|| ORDER LIST ||============================== //

const OrderLists = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const [isLoading, setIsLoading] = React.useState(false);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);

    const fetchOrder = useCallback((searchKeyWord) => {
        setIsLoading(true);
        axios
            .get('/subscriptionorders', { params: { search: searchKeyWord } })
            .then((resData) => {
                const orderList = resData.data;
                setRows(orderList);
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
    }, []);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

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

    return (
        <MainCard title="Subscription Order List" content={false}>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <CardContent>
                        <Grid container justifyContent="space-between" alignItems="center" spacing={2}>
                            <Grid item xs={12} sm={6}>
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
                                        if (e.key === 'Enter') fetchOrder(search);
                                    }}
                                    value={search}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>

                    {/* table */}
                    <TableContainer>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                                <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                <TableBody>
                                    {stableSort(rows, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            /** Make sure no display bugs if row isn't an OrderData object */
                                            if (typeof row === 'number') return null;

                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                    <TableCell padding="checkbox" sx={{ pl: 3 }}>
                                                        <Typography align="center">{index + 1 + page * rowsPerPage}</Typography>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Link
                                                            variant="subtitle1"
                                                            href={`/user/detail?user_id=${row.user_id}`}
                                                            underline="hover"
                                                        >
                                                            {row.user_id}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">{row.amount_paid}</TableCell>
                                                    <TableCell align="center">
                                                        {row.status ? (
                                                            <Chip
                                                                label="Succeed"
                                                                size="small"
                                                                sx={{
                                                                    background: theme.palette.success.dark,
                                                                    color: 'white'
                                                                }}
                                                            />
                                                        ) : (
                                                            <Chip
                                                                label="Failed"
                                                                size="small"
                                                                sx={{
                                                                    background: theme.palette.warning.dark,
                                                                    color: 'white'
                                                                }}
                                                            />
                                                        )}
                                                    </TableCell>
                                                    <TableCell align="center">{new Date(row.created_at).toLocaleString()}</TableCell>
                                                    <TableCell align="center" sx={{ pr: 3 }}>
                                                        <Tooltip placement="top" title="Refund">
                                                            <IconButton
                                                                color="primary"
                                                                size="large"
                                                                aria-label="view"
                                                                // onClick={() => handlePrintLabel(row.id)}
                                                            >
                                                                <IconReceiptRefund stroke={1.5} size="16px" />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>

                    {/* table pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50, 100]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
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

export default OrderLists;
