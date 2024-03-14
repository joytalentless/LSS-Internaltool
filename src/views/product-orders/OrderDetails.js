import PropTypes from 'prop-types';
// material-ui
import React, { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import {
    Box,
    Button,
    CardContent,
    Divider,
    Grid,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';

// project imports
import SubCard from 'ui-component/cards/SubCard';
import Chip from 'ui-component/extended/Chip';
import { gridSpacing } from 'store/constant';
import MainCard from 'ui-component/cards/MainCard';

// assets
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
// import PhoneAndroidTwoToneIcon from '@mui/icons-material/PhoneAndroidTwoTone';
import AlertDialog from 'ui-component/AlertDialog';
import useAuth from 'hooks/useAuth';

const sxDivider = {
    borderColor: 'primary.light'
};

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
        id: 'product_id',
        numeric: true,
        label: 'Product ID',
        align: 'center'
    },
    {
        id: 'product_name',
        numeric: false,
        label: 'Product Name',
        align: 'center'
    },
    {
        id: 'variant_index',
        numeric: false,
        label: 'Variant Index',
        align: 'center'
    },
    {
        id: 'product_price',
        numeric: true,
        label: 'Price',
        align: 'center'
    },
    {
        id: 'quantity',
        numeric: true,
        label: 'Quantity',
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

const OrderDetails = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const location = useLocation();
    const [editIndex, setEditInternalStateIndex] = React.useState(-1); // state to track the index being edited
    const [isEditMode, setIsEditMode] = React.useState(false); // state to track edit mode
    const [isOpenDeleteDialog, setIsOpenDeleteDialog] = React.useState(false);
    const [userId, setUserId] = React.useState(0);
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [shippingAddress, setShippingAddress] = React.useState(null);
    const [billingAddress, setBillingAddress] = React.useState(null);
    const [orderStatus, setOrderStatus] = React.useState(null);
    const [paidAmount, setPaidAmount] = React.useState(0);
    const [shippingAmount, setShippingAmount] = React.useState(0);
    const [savedAmount, setSavedAmount] = React.useState(0);

    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [rows, setRows] = React.useState([]);
    const [selectedRow, setSelectedRow] = React.useState(0);

    // const [dimensionEnterType, setDimensionEnterType] = React.useState('0');
    // const [standardDimension, setStandardDimension] = React.useState(1);
    // const [unitD, setUnitD] = React.useState(1);
    // const [unitW, setUnitW] = React.useState(1);
    // const [dimension, setDimension] = React.useState({});

    // const [length, setLength] = React.useState(0);
    // const [width, setWidth] = React.useState(0);
    // const [height, setHeight] = React.useState(0);

    const queryParams = new URLSearchParams(location.search);
    const orderNumber = queryParams.get('order_number');

    // const STANDARD_DIMENSION = [
    //     {
    //         index: 1,
    //         label: '4 * 4 * 4',
    //         length: 4,
    //         width: 4,
    //         height: 4
    //     },
    //     {
    //         index: 2,
    //         label: '5 * 5 * 5',
    //         length: 5,
    //         width: 5,
    //         height: 5
    //     },
    //     {
    //         index: 3,
    //         label: '6 * 4 * 4',
    //         length: 6,
    //         width: 4,
    //         height: 4
    //     },
    //     {
    //         index: 4,
    //         label: '8 * 6 * 4',
    //         length: 8,
    //         width: 6,
    //         height: 4
    //     },
    //     {
    //         index: 5,
    //         label: '12 * 6 * 6',
    //         length: 12,
    //         width: 6,
    //         height: 6
    //     },
    //     {
    //         index: 6,
    //         label: '15 * 12 * 10',
    //         length: 15,
    //         width: 12,
    //         height: 10
    //     },
    //     {
    //         index: 7,
    //         label: '16 * 12 * 12',
    //         length: 16,
    //         width: 12,
    //         height: 12
    //     },
    //     {
    //         index: 8,
    //         label: '18 * 18 * 16',
    //         length: 18,
    //         width: 16,
    //         height: 16
    //     },
    //     {
    //         index: 9,
    //         label: '18 * 18 * 24',
    //         length: 18,
    //         width: 18,
    //         height: 24
    //     },
    //     {
    //         index: 10,
    //         label: '24 * 18 * 24',
    //         length: 24,
    //         width: 18,
    //         height: 24
    //     },
    //     {
    //         index: 11,
    //         label: '12 * 12 * 40',
    //         length: 12,
    //         width: 12,
    //         height: 40
    //     },
    //     {
    //         index: 12,
    //         label: '20 * 20 * 34',
    //         length: 20,
    //         width: 20,
    //         height: 34
    //     },
    //     {
    //         index: 13,
    //         label: '18 * 18 * 28',
    //         length: 18,
    //         width: 18,
    //         height: 28
    //     },
    //     {
    //         index: 14,
    //         label: '24 * 24 * 12',
    //         length: 24,
    //         width: 24,
    //         height: 12
    //     },
    //     {
    //         index: 15,
    //         label: '36 * 36 * 36',
    //         length: 36,
    //         width: 36,
    //         height: 36
    //     }
    // ];

    // const UNIT_D = [
    //     {
    //         index: 1,
    //         label: 'inch'
    //     },
    //     {
    //         index: 2,
    //         label: 'ft'
    //     },
    //     {
    //         index: 3,
    //         label: 'yd'
    //     },
    //     {
    //         index: 4,
    //         label: 'm'
    //     },
    //     {
    //         index: 5,
    //         label: 'cm'
    //     }
    // ];

    // const UNIT_W = [
    //     {
    //         index: 1,
    //         label: 'oz'
    //     },
    //     {
    //         index: 2,
    //         label: 'lb'
    //     },
    //     {
    //         index: 3,
    //         label: 'kg'
    //     },
    //     {
    //         index: 4,
    //         label: 't'
    //     }
    // ];

    /*
    // To be deleted
    const dummyOrder = {
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
        amount_paid: 100,
        amount_saved: 0,
        amount_shipping: 20,
        order_status: 'confirmed',
        created_at: '2023-10-30T12:29:29.579722Z',
        modified_at: '2023-10-30T10:24:08.832267Z'
    };
    */

    /*
    const orderDummy = {
        number: '790841',
        name: 'Joseph William 1',
        email: 'JosephWilliam@hotmail.com',
        timestamp: '12.07.2018',
        total_amount: 2500,
        total_pieces: 5,
        order_status: 0,
        items: [
            {
                name: 'Mobile0243',
                quantity: 2,
                price: 500,
                currency: '$',
                internal_status: 0,
                outgoing_status: 0,
                bought_address: '4898 Joanne Lane street from',
                sendout_address: '4898 Joanne Lane street to'
            },
            {
                name: 'Mobile0243',
                quantity: 2,
                price: 500,
                currency: '$',
                internal_status: 1,
                outgoing_status: 1,
                bought_address: '4898 Joanne Lane street from',
                sendout_address: '4898 Joanne Lane street to'
            },
            {
                name: 'Mobile0243',
                quantity: 2,
                price: 500,
                currency: '$',
                internal_status: 2,
                outgoing_status: 2,
                bought_address: '4898 Joanne Lane street from',
                sendout_address: '4898 Joanne Lane street to'
            }
        ]
    };

    useEffect(() => {
        setOrder({ ...order, ...orderDummy });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
*/
    useEffect(() => {
        async function fetchOrderDetail() {
            try {
                /*
                const orderList = dummyOrder.order_items.map((item) => ({
                    ...item,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    product_price: item.product.price
                }));
                setRows(orderList);
                setUserId(dummyOrder.user_id);
                setPaymentMethod(dummyOrder.payment);
                setShippingAddress(dummyOrder.shipping_address);
                setBillingAddress(dummyOrder.billing_address);
                setOrderStatus(dummyOrder.order_status);

                setPaidAmount(dummyOrder.amount_paid);
                setSavedAmount(dummyOrder.amount_saved);
                setShippingAmount(dummyOrder.amount_shipping);
                */

                const response = await axios.get(`/orders/orderDetails/${orderNumber}`);
                const orderItems = response.data.order_items;
                setUserId(response.data.user_id);
                setPaymentMethod(response.data.payment);
                setShippingAddress(response.data.shipping_address);
                setBillingAddress(response.data.billing_address);
                setOrderStatus(response.data.order_status);

                setPaidAmount(response.data.amount_paid);
                setSavedAmount(response.data.amount_saved ? response.data.amount_saved : 0);
                setShippingAmount(response.data.amount_shipping);

                const orderList = orderItems.map((item) => ({
                    ...item,
                    product_id: item.product.id,
                    product_name: item.product.name,
                    product_price: item.product.price
                }));
                setRows(orderList);
            } catch (err) {
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Some thing went wrong!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            }
        }
        fetchOrderDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const handleEditInternalState = (index) => {
        setIsEditMode(true);
        setEditInternalStateIndex(index);
    };

    const handleDeleteItem = () => {
        setIsOpenDeleteDialog(false);
        setOrder({
            ...order,
            items: order.items.filter((item, i) => i !== selectedRow)
        });
    };

    const handleCancelDeleteItem = () => {
        setIsOpenDeleteDialog(false);
    };

    const handleConfirmClick = (index) => {
        setIsEditMode(false);
        setOrder({
            ...order,
            items: order.items.map((item, i) =>
                i === index
                    ? {
                          ...item,
                          internal_status: parseInt(0, 10),
                          outgoing_status: parseInt(0, 10)
                      }
                    : item
            )
        });
    };

    const handleCancelClick = () => {
        setIsEditMode(false);
        setEditInternalStateIndex(-1);
    };

    // const handleWeightChange = (value) => {
    //     setDimension((oldDimension) => ({ ...oldDimension, ...value }));
    // };

    // const handlePrintLabel = async () => {
    //     try {
    //         if (dimensionEnterType === '0') {
    //             console.log(...STANDARD_DIMENSION[standardDimension], UNIT_D[unitD], UNIT_W[unitW]);
    //             // await axios.get('', { test: standardDimension });
    //         } else {
    //             console.log(height, length, width, UNIT_D[unitD], UNIT_W[unitW]);
    //             // await axios.get('', { height, length, width });
    //         }
    //     } catch (error) {
    //         dispatch(
    //             openSnackbar({
    //                 open: true,
    //                 anchorOrigin: { vertical: 'top', horizontal: 'right' },
    //                 message: error.error,
    //                 variant: 'alert',
    //                 alert: {
    //                     color: 'error'
    //                 }
    //             })
    //         );
    //         console.log(error);
    //     }
    // };

    const handlePrintLabel = async () => {
        try {
            await axios.post(`/orders/orderDetails/${orderNumber}/printLabel`);
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
                    message: error.error,
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
            console.log(error);
        }
    };

    return (
        <MainCard title="Order Details">
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <AlertDialog
                        type="delete"
                        open={isOpenDeleteDialog}
                        handleConfirmAction={handleDeleteItem}
                        handleClose={handleCancelDeleteItem}
                    />
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <SubCard
                                title="Order Status"
                                secondary={
                                    <Typography variant="subtitle1">
                                        {orderStatus === 'pending' && <Chip label="Pending" size="small" chipcolor="orange" />}
                                        {orderStatus === 'cancelled' && <Chip label="Cancelled" size="small" chipcolor="primary" />}
                                        {orderStatus === 'confirmed' && <Chip label="Confirmed" size="small" chipcolor="success" />}
                                    </Typography>
                                }
                            >
                                <Grid container spacing={gridSpacing}>
                                    <Grid item xs={12}>
                                        <Grid container spacing={gridSpacing}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Stack spacing={2}>
                                                    <Typography variant="h4">User Info</Typography>
                                                    <Stack spacing={0}>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Order Number :</Typography>
                                                            <Typography variant="body2">{orderNumber}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">User ID :</Typography>
                                                            <Typography variant="body2">{userId}</Typography>
                                                        </Stack>
                                                        <Link variant="subtitle1" href={`/user/detail?user_id=${userId}`} underline="hover">
                                                            See more details...
                                                        </Link>
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Stack spacing={2}>
                                                    <Typography variant="h4">Payment method</Typography>
                                                    <Stack spacing={0}>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Method :</Typography>
                                                            <Typography variant="body2">Credit Card</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Provider :</Typography>
                                                            <Typography variant="body2">{paymentMethod?.provider}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Name :</Typography>
                                                            <Typography variant="body2">{paymentMethod?.name}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">CVC :</Typography>
                                                            <Typography variant="body2">{paymentMethod?.cvc}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider sx={sxDivider} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Grid container spacing={gridSpacing}>
                                            <Grid item sm={6} md={4}>
                                                <Stack spacing={2}>
                                                    <Typography variant="h4">Billing address</Typography>
                                                    <Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Address :</Typography>
                                                            <Typography variant="body2">
                                                                {billingAddress?.address[0].toUpperCase() +
                                                                    billingAddress?.address.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">City :</Typography>
                                                            <Typography variant="body2">
                                                                {billingAddress?.city[0].toUpperCase() + billingAddress?.city.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">State :</Typography>
                                                            <Typography variant="body2">
                                                                {billingAddress?.state[0].toUpperCase() +
                                                                    billingAddress?.state.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Zip code :</Typography>
                                                            <Typography variant="body2">{billingAddress?.zip}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Country :</Typography>
                                                            <Typography variant="body2">
                                                                {billingAddress?.country[0].toUpperCase() +
                                                                    billingAddress?.country.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Phone :</Typography>
                                                            <Typography variant="body2">{billingAddress?.phone}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                            <Grid item sm={6} md={4}>
                                                <Stack spacing={2}>
                                                    <Typography variant="h4">Shipping address</Typography>
                                                    <Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Address :</Typography>
                                                            <Typography variant="body2">
                                                                {shippingAddress?.address[0].toUpperCase() +
                                                                    shippingAddress?.address.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">City :</Typography>
                                                            <Typography variant="body2">
                                                                {shippingAddress?.city[0].toUpperCase() +
                                                                    shippingAddress?.city.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">State :</Typography>
                                                            <Typography variant="body2">
                                                                {shippingAddress?.state[0].toUpperCase() +
                                                                    shippingAddress?.state.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Zip code :</Typography>
                                                            <Typography variant="body2">{shippingAddress?.zip}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Country :</Typography>
                                                            <Typography variant="body2">
                                                                {shippingAddress?.country[0].toUpperCase() +
                                                                    shippingAddress?.country.substring(1)}
                                                            </Typography>
                                                        </Stack>
                                                    </Stack>
                                                    <Stack>
                                                        <Stack direction="row" spacing={1}>
                                                            <Typography variant="subtitle1">Phone :</Typography>
                                                            <Typography variant="body2">{shippingAddress?.phone}</Typography>
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </SubCard>
                        </Grid>
                        <Grid item xs={12}>
                            <SubCard title="Products" content={false}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        {/* table */}
                                        <TableContainer>
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
                                                                        <Typography align="center">
                                                                            {index + 1 + page * rowsPerPage}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Typography> {row.product_id} </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Typography> {row.product_name} </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Typography> {row.variant_index} </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Typography>
                                                                            {' '}
                                                                            {row.product_price ? row.product_price : 'NA'}{' '}
                                                                        </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        <Typography> {row.quantity ? row.quantity : 'NA'} </Typography>
                                                                    </TableCell>
                                                                    <TableCell align="center">
                                                                        {editIndex === index && isEditMode ? (
                                                                            <>
                                                                                <IconButton
                                                                                    color="success"
                                                                                    size="small"
                                                                                    onClick={() => handleConfirmClick(index)}
                                                                                    aria-label="Confirm"
                                                                                >
                                                                                    <CheckIcon fontSize="small" />
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    color="error"
                                                                                    size="small"
                                                                                    onClick={() => handleCancelClick()}
                                                                                    aria-label="Cancel"
                                                                                >
                                                                                    <CloseIcon fontSize="small" />
                                                                                </IconButton>
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <IconButton
                                                                                    color="primary"
                                                                                    size="large"
                                                                                    aria-label="product edit"
                                                                                    onClick={() => handleEditInternalState(index)}
                                                                                >
                                                                                    <EditIcon />
                                                                                </IconButton>
                                                                                <IconButton
                                                                                    color="primary"
                                                                                    size="large"
                                                                                    aria-label="product delete"
                                                                                    onClick={() => {
                                                                                        setSelectedRow(index);
                                                                                        setIsOpenDeleteDialog(true);
                                                                                    }}
                                                                                >
                                                                                    <DeleteTwoToneIcon />
                                                                                </IconButton>
                                                                            </>
                                                                        )}
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        })}
                                                </TableBody>
                                            </Table>
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
                                    </Grid>
                                    <Grid item xs={12}>
                                        <SubCard
                                            sx={{
                                                mx: 3,
                                                mb: 3,
                                                bgcolor:
                                                    theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light
                                            }}
                                        >
                                            <Grid container justifyContent="flex-end" spacing={gridSpacing} mb={3}>
                                                <Grid item sm={6} md={4}>
                                                    <Grid container spacing={2}>
                                                        <Grid item xs={12}>
                                                            <Grid container spacing={1}>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" variant="subtitle1">
                                                                        Total Item Cost :
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" variant="body2">
                                                                        $ {paidAmount}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" variant="subtitle1">
                                                                        Saved :
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" variant="body2">
                                                                        $ {savedAmount}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" variant="subtitle1">
                                                                        Shipping :
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" variant="body2">
                                                                        $ {shippingAmount}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Divider sx={{ bgcolor: 'dark.main' }} />
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Grid container spacing={1}>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" color="primary" variant="subtitle1">
                                                                        Total :
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item xs={6}>
                                                                    <Typography align="right" color="primary" variant="subtitle1">
                                                                        $ {paidAmount + savedAmount + shippingAmount}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </SubCard>
                                        <Stack
                                            justifyContent="end"
                                            sx={{
                                                mx: 3,
                                                mb: 3,
                                                bgcolor:
                                                    theme.palette.mode === 'dark' ? theme.palette.dark.main : theme.palette.primary.light
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                type="submit"
                                                sx={{ width: '150px', alignSelf: 'end' }}
                                                onClick={handlePrintLabel}
                                            >
                                                Print Label
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </SubCard>
                        </Grid>
                        {/* <Grid item xs={12}>
                            <SubCard title="Shipping info" content={false}>
                                <Grid item xs={12} sx={{ p: '24px' }}>
                                    <Stack>
                                        <FormControl>
                                            <RadioGroup
                                                row
                                                aria-label="dimension"
                                                value={dimensionEnterType}
                                                onChange={(e) => {
                                                    setDimensionEnterType(e.target.value);
                                                    setUnitD(UNIT_D[0].index);
                                                    setStandardDimension(STANDARD_DIMENSION[0].index);
                                                    setLength(0);
                                                    setWidth(0);
                                                    setHeight(0);
                                                }}
                                                name="row-radio-buttons-group"
                                            >
                                                <FormControlLabel value="0" control={<Radio />} label="Use Standard Dimension" />
                                                <FormControlLabel value="1" control={<Radio />} label="Enter Dimension manually" />
                                            </RadioGroup>
                                        </FormControl>
                                        {dimensionEnterType === '0' && (
                                            <Stack flexDirection="row" gap={2}>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>dimension:</Typography>
                                                    <Select
                                                        size="small"
                                                        id="dimension"
                                                        name="dimension"
                                                        placeholder="Dimension"
                                                        fullWidth
                                                        value={standardDimension}
                                                        onChange={(e) => setStandardDimension(e.target.value)}
                                                    >
                                                        {STANDARD_DIMENSION.map((dimension, index) => (
                                                            <MenuItem key={index} value={dimension.index}>
                                                                {dimension.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Stack>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>unit:</Typography>
                                                    <Select
                                                        fullWidth
                                                        size="small"
                                                        id="unit"
                                                        name="unit"
                                                        placeholder="Unit"
                                                        value={unitD}
                                                        onChange={(e) => setUnitD(e.target.value)}
                                                    >
                                                        {UNIT_D.map((unit, index) => (
                                                            <MenuItem key={index} value={unit.index}>
                                                                {unit.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Stack>
                                            </Stack>
                                        )}
                                        {dimensionEnterType === '1' && (
                                            <Stack flexDirection="row" gap={2}>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>length:</Typography>
                                                    <TextField
                                                        fullWidth
                                                        name="length"
                                                        size="small"
                                                        value={length}
                                                        type="number"
                                                        onChange={(e) => setLength(e.target.value < 0 ? 0 : e.target.value)}
                                                    />
                                                </Stack>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>width:</Typography>
                                                    <TextField
                                                        fullWidth
                                                        name="width"
                                                        size="small"
                                                        value={width}
                                                        type="number"
                                                        onChange={(e) => setWidth(e.target.value < 0 ? 0 : e.target.value)}
                                                    />
                                                </Stack>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>height:</Typography>
                                                    <TextField
                                                        fullWidth
                                                        name="height"
                                                        size="small"
                                                        value={height}
                                                        type="number"
                                                        onChange={(e) => setHeight(e.target.value < 0 ? 0 : e.target.value)}
                                                    />
                                                </Stack>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>unit:</Typography>
                                                    <Select
                                                        fullWidth
                                                        size="small"
                                                        id="unit"
                                                        name="unit"
                                                        placeholder="Unit"
                                                        value={unitD}
                                                        onChange={(e) => setUnitD(e.target.value)}
                                                    >
                                                        {UNIT_D.map((unit, index) => (
                                                            <MenuItem key={index} value={unit.index}>
                                                                {unit.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Stack>
                                            </Stack>
                                        )}
                                        <Stack gap={2}>
                                            <Stack flexDirection="row" gap={2} mt={2}>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>weight:</Typography>
                                                    <TextField
                                                        fullWidth
                                                        name="firstName"
                                                        size="small"
                                                        type="number"
                                                        value={dimension.weight}
                                                        onChange={(e) => handleWeightChange(e.target.value < 0 ? 0 : e.target.value)}
                                                    />
                                                </Stack>
                                                <Stack flexDirection="row" gap={2} width="100%" alignItems="center">
                                                    <Typography>unit:</Typography>
                                                    <Select
                                                        fullWidth
                                                        size="small"
                                                        id="unit"
                                                        name="unit"
                                                        placeholder="Unit"
                                                        value={unitW}
                                                        onChange={(e) => setUnitW(e.target.value)}
                                                    >
                                                        {UNIT_W.map((unit, index) => (
                                                            <MenuItem key={index} value={unit.index}>
                                                                {unit.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Stack>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Grid>
                            </SubCard>
                        </Grid> */}
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

export default OrderDetails;
