import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

// material-ui
import {
    Box,
    CardContent,
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    Link,
    MenuItem,
    OutlinedInput,
    Select,
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
// import Chip from 'ui-component/extended/Chip';
import MainCard from 'ui-component/cards/MainCard';
// import { useDispatch } from 'store';

// assets
import { IconSearch } from '@tabler/icons';
import PrintIcon from '@mui/icons-material/Print';
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

const ORDER_STATE = [
    { name: 'Initial', value: 'empty' },
    { name: 'Pending', value: 'pending' },
    { name: 'Confirmed', value: 'confirmed' },
    { name: 'On the way', value: 'onway' },
    { name: 'Delivered', value: 'delivered' },
    { name: 'Cancelled', value: 'cancelled' },
    { name: 'Refunded', value: 'refunded' }
];

// table header options

const headCells = [
    {
        id: 'id',
        numeric: true,
        label: 'Order Number',
        align: 'center'
    },
    {
        id: 'user_id',
        numeric: false,
        label: 'Customer ID',
        align: 'center'
    },
    {
        id: 'order_items_length',
        numeric: true,
        label: 'Total Items',
        align: 'center'
    },
    {
        id: 'created_at',
        numeric: true,
        label: 'Created',
        align: 'center'
    },
    {
        id: 'order_status',
        numeric: false,
        label: 'Status',
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
    const [isLoading, setIsLoading] = React.useState(false);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);
    /*
    const orders = [
        {
            id: 6,
            user_id: 2,
            order_items: [
                {
                    id: 16,
                    order_detail_id: 6,
                    product: {
                        id: 5084,
                        name: 'Dining Table',
                        category: {
                            id: 11,
                            name: 'Furniture',
                            description: 'Furniture',
                            created_at: '2023-10-29T22:05:50.973808Z',
                            modified_at: '2023-10-29T19:45:34.473630Z',
                            is_active: true
                        },
                        variants: [
                            {
                                id: 5081,
                                product_id: 5084,
                                index: 1,
                                is_active: true,
                                created_at: '2023-10-29T21:41:45.659857Z',
                                modified_at: '2023-10-29T21:41:45.659882Z',
                                metadata: [
                                    {
                                        id: 25608,
                                        variant_id: 5081,
                                        field: 'Designer',
                                        value: 'Jacques Dumond',
                                        index: 1,
                                        is_active: true,
                                        created_at: '2023-10-29T21:41:46.249189Z',
                                        modified_at: '2023-10-29T21:41:46.249214Z'
                                    },
                                    {
                                        id: 25609,
                                        variant_id: 5081,
                                        field: 'Material',
                                        value: 'Stainless steel, glass',
                                        index: 2,
                                        is_active: true,
                                        created_at: '2023-10-29T21:41:46.253826Z',
                                        modified_at: '2023-10-29T21:41:46.253842Z'
                                    },
                                    {
                                        id: 25610,
                                        variant_id: 5081,
                                        field: 'Year',
                                        value: '1964',
                                        index: 3,
                                        is_active: true,
                                        created_at: '2023-10-29T21:41:46.275414Z',
                                        modified_at: '2023-10-29T21:41:46.275437Z'
                                    }
                                ],
                                media: [
                                    {
                                        id: 12285,
                                        variant_id: 5081,
                                        index: 1,
                                        url: 'https://lss-prod-public.s3.amazonaws.com/image/products/1698615707788-2.jpeg',
                                        is_active: true,
                                        created_at: '2023-10-29T21:41:49.061227Z',
                                        modified_at: '2023-10-29T21:41:49.061248Z'
                                    },
                                    {
                                        id: 12286,
                                        variant_id: 5081,
                                        index: 2,
                                        url: 'https://lss-prod-public.s3.amazonaws.com/image/products/1698615709903-1.jpeg',
                                        is_active: true,
                                        created_at: '2023-10-29T21:41:51.098176Z',
                                        modified_at: '2023-10-29T21:41:51.098201Z'
                                    }
                                ],
                                inventory: {
                                    variant_id: 5081,
                                    price: null,
                                    currency: null,
                                    quantity: 1,
                                    is_active: true
                                }
                            }
                        ],
                        description: null,
                        source_url: 'https://www.demischdanant.com/works/jacques-dumond23',
                        is_active: true,
                        published_at: null,
                        price: null,
                        currency: null,
                        created_at: '2023-10-29T21:41:44.910847Z',
                        is_published: false,
                        modified_at: '2023-10-29T21:41:44.883086Z'
                    },
                    quantity: 1,
                    created_at: '2023-10-30T12:28:36.104956Z',
                    modified_at: '2023-10-30T12:28:36.104981Z'
                }
            ],
            shipping_address: {
                id: 1,
                user_id: 2,
                name: 'adam',
                address: 'address-canada -111111',
                city: 'canada',
                state: 'canada',
                zip: '111111',
                country: 'canada',
                phone: '123456789',
                is_default: false,
                is_deleted: false,
                created_at: '2023-10-30T09:12:14.041516Z',
                modified_at: '2023-10-30T09:12:14.041541Z'
            },
            billing_address: {
                id: 1,
                user_id: 2,
                name: 'adam',
                address: 'address-canada -111111',
                city: 'canada',
                state: 'canada',
                zip: '111111',
                country: 'canada',
                phone: '123456789',
                is_default: false,
                is_deleted: false,
                created_at: '2023-10-30T09:12:14.041516Z',
                modified_at: '2023-10-30T09:12:14.041541Z'
            },
            payment: {
                id: 1,
                user_id: 2,
                method: 'card',
                provider: '1234567890',
                name: 'adam',
                date: '2023-10-04T00:00:00Z',
                cvc: '111',
                is_default: false,
                is_deleted: false,
                created_at: '2023-10-30T09:19:44.366073Z',
                modified_at: '2023-10-30T09:19:44.366086Z'
            },
            order_status: 'confirmed',
            created_at: '2023-10-30T12:29:29.579722Z',
            modified_at: '2023-10-30T10:24:08.832267Z'
        }
    ];
    */
    const fetchOrder = useCallback((searchKeyWord) => {
        /*
        const orderList = orders.map((orderData) => ({
            ...orderData,
            order_items_length: orderData.order_items.length
        }));
        setRows(orderList);
        */

        setIsLoading(true);
        axios
            .get('/orders/orderDetails', { params: { search: searchKeyWord } })
            .then((resData) => {
                const orderList = resData.data.map((orderData) => ({
                    ...orderData,
                    order_items_length: orderData.order_items.length
                }));
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

    const handlePrintLabel = async (orderID) => {
        try {
            await axios.post(`/orders/orderDetails/${orderID}/printLabel`);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Label printed successfully!',
                    variant: 'alert'
                })
            );
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Label print failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const handleRowOrderStateUpdate = async (value, orderID) => {
        if (value !== 'refunded') {
            try {
                await axios.put(`/orders/orderDetails/${orderID}`, { order_status: value });
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Order updated successfully!',
                        variant: 'alert'
                    })
                );
                fetchOrder();
            } catch (error) {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Order update failed',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            }
        } else {
            try {
                await axios.put(`/orders/orderDetails/${orderID}/cancel`);
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Order cancelled and refunded successfully!',
                        variant: 'alert'
                    })
                );
                fetchOrder();
            } catch (error) {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Order cancel failed',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            }
        }
    };

    return (
        <MainCard title="Order List" content={false}>
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
                                                            href={`/order/productorder/detail?order_number=${row.id}`}
                                                            underline="hover"
                                                        >
                                                            {row.id}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Typography> {row.user_id} </Typography>
                                                    </TableCell>
                                                    <TableCell align="center">{row.order_items_length}</TableCell>
                                                    <TableCell align="center">{new Date(row.created_at).toLocaleString()}</TableCell>
                                                    <TableCell align="center">
                                                        <Select
                                                            size="small"
                                                            fullWidth
                                                            id="productType"
                                                            name="productType"
                                                            placeholder="Category"
                                                            value={row.order_status}
                                                            onChange={(e) => handleRowOrderStateUpdate(e.target.value, row.id)}
                                                        >
                                                            {ORDER_STATE.map((item, index) => (
                                                                <MenuItem key={index} value={item.value}>
                                                                    {item.name}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </TableCell>
                                                    <TableCell align="center" sx={{ pr: 3 }}>
                                                        <Tooltip placement="top" title="Print Label">
                                                            <IconButton
                                                                color="primary"
                                                                size="large"
                                                                aria-label="view"
                                                                onClick={() => handlePrintLabel(row.id)}
                                                            >
                                                                <PrintIcon sx={{ fontSize: '1.3rem' }} />
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
