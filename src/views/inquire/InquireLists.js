import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

// material-ui
import {
    Box,
    Button,
    CircularProgress,
    Collapse,
    Grid,
    InputAdornment,
    OutlinedInput,
    CardContent,
    IconButton,
    Link,
    Table,
    TableBody,
    TableCell,
    TableSortLabel,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Toolbar,
    Typography,
    Select,
    MenuItem
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import InquireResolveModal from 'ui-component/InquireResolveModal';

// assets
import { IconSearch } from '@tabler/icons';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import useAuth from 'hooks/useAuth';

// table header options
const headCells = [
    {
        id: 'id',
        numeric: false,
        label: 'ID',
        align: 'center'
    },
    {
        id: 'username',
        numeric: false,
        label: 'User',
        align: 'center'
    },
    {
        id: 'product_name',
        numeric: false,
        label: 'Product',
        align: 'center'
    },
    {
        id: 'variant',
        numeric: false,
        label: 'Variant ID',
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

function EnhancedTableHead({ order, orderBy, onRequestSort }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell key="empty-cell" />
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.align}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        {headCell.id === 'image' ? (
                            headCell.label
                        ) : (
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
                        )}
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
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired
};

// ==============================|| Inquire LIST ||============================== //

const InquireLists = () => {
    const { user: myInfo } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('modified_at');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);
    const [totalCount, setTotalCount] = React.useState(0);
    const [searchIsResolved, setSearchIsResolved] = React.useState(2);

    const isResolvedTypes = [
        { value: 0, label: 'Resolved/Not Resolved' },
        { value: 1, label: 'Resolved' },
        { value: 2, label: 'Not Resolved' }
    ];

    const fetchProducts = useCallback(
        () => {
            let isResolved;

            if (searchIsResolved === 0) {
                isResolved = '';
            } else if (searchIsResolved === 1) {
                isResolved = true;
            } else {
                isResolved = false;
            }
            setIsLoading(true);
            axios
                .get('/inquires/', {
                    params: {
                        p: page + 1,
                        order_by: orderBy,
                        desc: order !== 'asc',
                        page_size: rowsPerPage,
                        is_resolved: isResolved
                    }
                })
                .then((resData) => {
                    const productList = resData.data.results.map((productData) => ({
                        ...productData,
                        userid: productData.user.id,
                        username: productData.user.username,
                        product_id: productData.product?.id,
                        product_name: productData.product?.name,
                        variant: productData.variant,
                        created_at: new Date(productData.created_at).toLocaleString()
                    }));
                    setTotalCount(resData.data.count);
                    setRows(productList);
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
        [page, rowsPerPage, order, orderBy, searchIsResolved]
    );

    useEffect(() => {
        fetchProducts(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProducts]);

    const handleRemoveRow = (id) => {
        const newRows = rows.filter((row) => row.id !== id);
        setRows(newRows);
    };

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
        // setPage(0);
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

    // table filter
    function descendingComparator(a, b, orderBy) {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    }

    function getComparator(order, orderBy) {
        return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
    }

    function stableSort(array, comparator) {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    }

    return (
        <MainCard title="Inquired Product" content={false}>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <CardContent>
                        <Grid container alignItems="center" justifyContent="space-between">
                            <Grid item xs={6} sm={3}>
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
                                        if (e.key === 'Enter') fetchProducts(search);
                                    }}
                                    value={search}
                                />
                            </Grid>
                            <Grid container alignItems="center" justifyContent="end" width="100%" marginRight="50px">
                                <Grid item xs={3} sm={2}>
                                    <Select
                                        size="small"
                                        fullWidth
                                        id="productActiveType"
                                        name="productActiveType"
                                        placeholder="Active"
                                        value={searchIsResolved}
                                        onChange={(e) => {
                                            setSearchIsResolved(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        {isResolvedTypes.map((category, index) => (
                                            <MenuItem key={index} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <Toolbar
                        sx={{
                            p: 0,
                            pl: 1,
                            pr: 1
                        }}
                    />
                    <TableContainer sx={{ overflow: 'visible' }}>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table sx={{ overflow: 'visible' }}>
                                <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                {/* table content */}
                                <TableBody sx={{ overflow: 'visible' }}>
                                    {stableSort(rows, getComparator(order, orderBy)).map((row) => {
                                        if (typeof row === 'number') return null;
                                        return <Row key={row.id} row={row} handleRemoveRow={handleRemoveRow} />;
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

export default InquireLists;

const Row = ({ row, handleRemoveRow }) => {
    const [open, setOpen] = React.useState(false);
    const [productID, setProductID] = React.useState(row.product_id);
    const [variantID, setVariationID] = React.useState(row.variant);
    const [adminNote, setAdminNote] = React.useState(row.admin_note);
    const [isResolved, setIsResolved] = React.useState(row.is_resolved);
    const [openInquireResolveModal, setOpenInquireResolveModal] = React.useState(false);
    const [modalOption, setModalOption] = React.useState('resolve'); // one of 'resolve' and 'product_add'

    const handleProductInquire = async (openModalOption) => {
        setOpenInquireResolveModal(true);
        setModalOption(openModalOption);
    };

    const handleInquireDelete = async () => {
        try {
            await axios.delete(`/inquires/${row.id}/`);
            handleRemoveRow(row.id);
        } catch (err) {
            console.error(err);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Inquire delete failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const closeInquireResolveModal = () => {
        setOpenInquireResolveModal(false);
    };

    const openSuccess = (newAdminNote, variantID, productID) => {
        dispatch(
            openSnackbar({
                open: true,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                message: 'Inquire is resolved successfully',
                variant: 'alert',
                alert: {
                    color: 'success'
                }
            })
        );
        if (productID) {
            setProductID(productID);
        } else {
            setVariationID(variantID);
            setIsResolved(true);
            setAdminNote(newAdminNote);
        }
    };

    const openFail = (msg) => {
        dispatch(
            openSnackbar({
                open: true,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                message: msg || 'Inquire update failed',
                variant: 'alert',
                alert: {
                    color: 'error'
                }
            })
        );
    };

    return (
        <>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' } }} key={row.id}>
                <TableCell sx={{ pl: 3 }}>
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell sx={{ pl: 3, textAlign: 'center' }}>{row.id}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                    <Link href={`/user/detail?user_id=${row.userid}`} underline="hover">
                        {row.username}
                    </Link>
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>
                    {productID ? (
                        <Link href={`/product/detail?product_id=${productID}`} underline="hover">
                            {productID}
                        </Link>
                    ) : (
                        'NA'
                    )}
                </TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{variantID || 'NA'}</TableCell>
                <TableCell sx={{ textAlign: 'center' }}>{row.created_at ? new Date(row.created_at).toLocaleString() : ''}</TableCell>
                <TableCell sx={{ textAlign: 'center', display: 'flex', flexDirection: 'row', gap: '10px' }}>
                    {isResolved && (
                        <Button fullWidth variant="outlined" size="large" onClick={() => handleProductInquire('resolve')}>
                            Edit
                        </Button>
                    )}
                    {!isResolved && productID && (
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            onClick={() => handleProductInquire('resolve')}
                            disabled={isResolved === true}
                        >
                            Resolve
                        </Button>
                    )}
                    {!isResolved && !productID && (
                        <Button
                            fullWidth
                            variant="outlined"
                            size="large"
                            onClick={() => handleProductInquire('product_add')}
                            disabled={isResolved === true}
                        >
                            Add Product
                        </Button>
                    )}
                    <Button fullWidth variant="outlined" size="large" onClick={() => handleInquireDelete()}>
                        Delete
                    </Button>
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        {open && (
                            <Box sx={{ margin: 1 }}>
                                <Typography component="div" sx={{ marginTop: '25px', marginBottom: '25px', marginLeft: '100px' }}>
                                    User notes: {row.user_note}
                                </Typography>
                                {row.reference_url && (
                                    <Grid container spacing={2} alignItems="center">
                                        <Grid item>
                                            <Typography
                                                component="div"
                                                sx={{ marginTop: '25px', marginBottom: '25px', marginLeft: '100px' }}
                                            >
                                                User uploaded:
                                            </Typography>
                                        </Grid>
                                        <Grid item>
                                            <Box
                                                sx={{
                                                    transition: 'transform 0.3s ease-in-out',
                                                    overflow: 'hidden',
                                                    '&:hover': {
                                                        transform: 'scale(6)',
                                                        zIndex: 9999
                                                    }
                                                }}
                                            >
                                                <img
                                                    key={row.reference_url}
                                                    src={row.reference_url}
                                                    width="50px"
                                                    alt={row.id}
                                                    style={{
                                                        border: '1px solid lightgrey',
                                                        borderRadius: '8px',
                                                        aspectRatio: '1',
                                                        zIndex: 9999
                                                    }}
                                                />
                                            </Box>
                                        </Grid>
                                    </Grid>
                                )}
                                <Typography component="div" sx={{ marginTop: '25px', marginBottom: '25px', marginLeft: '100px' }}>
                                    Admin notes: {adminNote}
                                </Typography>
                            </Box>
                        )}
                    </Collapse>
                </TableCell>
            </TableRow>
            <InquireResolveModal
                openModal={openInquireResolveModal}
                modalOption={modalOption}
                handleClose={closeInquireResolveModal}
                openSuccess={openSuccess}
                openFail={openFail}
                inquireID={row.id}
                variants={row.product?.variants}
            />
        </>
    );
};

Row.propTypes = {
    row: PropTypes.object,
    handleRemoveRow: PropTypes.func
};
