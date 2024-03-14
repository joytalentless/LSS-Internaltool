import React, { useCallback, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    CircularProgress,
    Grid,
    IconButton,
    InputAdornment,
    OutlinedInput,
    CardContent,
    Link,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Box,
    TextField
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import LaunchIcon from '@mui/icons-material/Launch';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import { IconSearch } from '@tabler/icons';

import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';
import { getMediaType } from 'utils/formatString';
import { CustomSwitch } from 'views/products/ProductLists';
import useAuth from 'hooks/useAuth';

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead() {
    return (
        <TableHead>
            <TableRow>
                <TableCell align="center">Product ID</TableCell>
                <TableCell align="center">Product Name</TableCell>
                <TableCell align="center">Media</TableCell>
                <TableCell align="center">Source URL</TableCell>
                <TableCell align="center">Price</TableCell>
                <TableCell align="center">Sold out</TableCell>
                <TableCell align="center">Published at</TableCell>
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Action
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

// ==============================|| USER LIST ||============================== //

const CurationLists = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const dispatch = useDispatch();
    // const navigate = useNavigate();

    const [isLoading, setIsLoading] = React.useState(false);
    const [newPublishDate, setNewPublishDate] = useState(new Date());
    const [newProductName, setNewProductName] = useState('');
    const [newProductSourceURL, setNewProductSourceURL] = useState('');
    const [newPrice, setNewPrice] = useState(undefined);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState([]);
    const [editing, setEditing] = useState({});
    const [editingCell, setEditingCell] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const todayBegin = new Date();
    const todayEnd = new Date();
    todayBegin.setHours(0, 0, 0, 0);
    todayEnd.setHours(23, 59, 59, 999);
    const [startPublishDate, setStartPublishDate] = useState(todayBegin);
    const [endPublishDate, setEndPublishDate] = useState(todayEnd);

    const fetchCurationList = useCallback(
        (searchKeyWord) => {
            setIsLoading(true);
            axios
                .get('/products/', {
                    params: {
                        p: page + 1,
                        order_by: 'published_at',
                        desc: true,
                        page_size: rowsPerPage,
                        is_active: true,
                        is_published: true,
                        search: searchKeyWord,
                        start_date: startPublishDate,
                        end_date: endPublishDate
                    }
                })
                .then((resData) => {
                    const publishedProducts = resData.data.results.filter((item) => item.published_at !== null && item.is_published);
                    setRows(publishedProducts);
                    setTotalCount(resData.data.count);
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
        [page, rowsPerPage, startPublishDate, endPublishDate]
    );

    useEffect(() => {
        fetchCurationList();
    }, [fetchCurationList]);

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

    // Table Row Editing
    const handleEditClick = (key, row) => {
        if (editingCell === false) {
            setEditing((prevState) => ({
                ...prevState,
                [key]: true
            }));
            for (let i = 0; i < rows.length; i += 1) {
                if (rows[i].id === row.id) {
                    setNewPublishDate(new Date(rows[i].published_at));
                    setNewProductName(rows[i].name);
                    setNewProductSourceURL(rows[i].source_url);
                    setNewPrice(rows[i].variants.filter((item) => item.is_active)[0]?.inventory.price);
                    break;
                }
            }
            setEditingCell(true);
        }
    };

    const handleProductNameChange = (name) => {
        setNewProductName(name);
    };

    const handleProductSourceURLChange = (sourceURL) => {
        setNewProductSourceURL(sourceURL);
    };

    const handlePriceChange = (price) => {
        setNewPrice(price);
    };

    const handleCancelClick = (key) => {
        setEditing((prevState) => ({
            ...prevState,
            [key]: false
        }));
        setEditingCell(false);
    };

    const handleConfirmClick = async (key) => {
        try {
            setEditing((prevState) => ({
                ...prevState,
                [key]: false
            }));
            rows[key].published_at = newPublishDate;
            rows[key].variants.filter((item) => item.is_active)[0].inventory.price = newPrice;
            rows[key].name = newProductName;
            rows[key].source_url = newProductSourceURL;
            await axios.put(`/products/${rows[key].id}/`, {
                ...rows[key],
                price: newPrice === '' ? null : newPrice,
                name: newProductName,
                source_url: newProductSourceURL
            });
            setRows([...rows]);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product updated successfully!',
                    variant: 'alert'
                })
            );
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product update failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        } finally {
            setNewPrice(undefined);
            setNewProductName('');
            setNewProductSourceURL('');
            setEditingCell(false);
        }
    };

    const handleProductSoldOut = async (newSoldOutStatus, productId) => {
        try {
            await axios.put(`/products/${productId}/`, { is_soldout: newSoldOutStatus });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product updated successfully!',
                    variant: 'alert'
                })
            );
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product update failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const checkIsSoldOut = (variants) => {
        let isSoldOut = false;
        if (variants.length === 0) isSoldOut = true;
        else if (variants.length > 0) {
            for (let i = 0; i < variants.length; i += 1) {
                const quantity = variants[i]?.inventory ? variants[i]?.inventory.quantity : 0;
                if (quantity === 0) isSoldOut = true;
            }
        }
        return isSoldOut;
    };

    const handleDelete = (row) => {
        axios
            .put(`/products/${row.id}/`, {
                ...row,
                published_at: null,
                is_published: false
            })
            .then(() => {
                setIsLoading(true);
                axios
                    .get('/products/', {
                        params: {
                            p: page + 1,
                            order_by: 'published_at',
                            desc: true,
                            page_size: rowsPerPage,
                            is_active: true,
                            is_published: true,
                            search,
                            start_date: startPublishDate,
                            end_date: endPublishDate
                        }
                    })
                    .then((resData) => {
                        const publishedProducts = resData.data.results.filter((item) => item.published_at !== null && item.is_published);
                        setRows(publishedProducts);
                        setTotalCount(resData.data.count);
                        setIsLoading(false);

                        dispatch(
                            openSnackbar({
                                open: true,
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                message: 'Success!',
                                variant: 'alert'
                            })
                        );
                    })
                    .catch((err) => {
                        setIsLoading(false);
                        console.log(err);
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

    const shortenUrl = (longUrl) => {
        const maxDisplayChars = 30;
        return longUrl.length > maxDisplayChars ? `${longUrl.substring(0, maxDisplayChars)}...` : longUrl;
    };

    return (
        <MainCard title="Curation Management" content={false}>
            {myInfo && myInfo.role && (myInfo.role.name === 'super_user' || myInfo.role.name === 'product_clean') ? (
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
                                        if (e.key === 'Enter') fetchCurationList(search);
                                    }}
                                    value={search}
                                />
                            </Grid>
                            <Grid item>
                                <Grid
                                    container
                                    alignItems="center"
                                    justifyContent="space-between"
                                    spacing={gridSpacing}
                                    marginTop="auto"
                                    marginBottom="auto"
                                >
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        Published at:&nbsp;&nbsp;
                                        <DateTimePicker
                                            slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                                            value={startPublishDate}
                                            onChange={(newValue) => {
                                                setStartPublishDate(newValue);
                                            }}
                                        />
                                    </LocalizationProvider>
                                    &nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;
                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                        <DateTimePicker
                                            slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                                            value={endPublishDate}
                                            onChange={(newValue) => {
                                                setEndPublishDate(newValue);
                                                console.log(startPublishDate);
                                            }}
                                        />
                                    </LocalizationProvider>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <TableContainer sx={{ overflow: 'visible' }}>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table sx={{ overflow: 'visible' }}>
                                <EnhancedTableHead theme={theme} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                <TableBody sx={{ overflow: 'visible' }}>
                                    {rows.map((row, index) => {
                                        if (typeof row === 'number') return null;
                                        const variant = row.variants.filter((item) => item.is_active).sort((a, b) => a.index - b.index)[0];
                                        const media =
                                            variant &&
                                            variant.media &&
                                            variant.media.filter((item) => item.is_active).sort((a, b) => a.index - b.index)[0];
                                        const url = media
                                            ? process.env.REACT_APP_MEDIA_BASE_URL +
                                              process.env.REACT_APP_MEDIA_THUMBNAIL_LOCATION +
                                              media.url
                                            : '';

                                        return (
                                            <TableRow hover tabIndex={-1} key={index}>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link
                                                        variant="subtitle1"
                                                        href={`/product/detail?product_id=${row.id}`}
                                                        underline="hover"
                                                    >
                                                        {row.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {editing[index] && (
                                                        <TextField
                                                            size="small"
                                                            type="text"
                                                            defaultValue={row.name}
                                                            onChange={(e) => handleProductNameChange(e.target.value)}
                                                        />
                                                    )}
                                                    {!editing[index] && (
                                                        <Link
                                                            variant="subtitle1"
                                                            href={`/product/detail?product_id=${row.id}`}
                                                            underline="hover"
                                                        >
                                                            {shortenUrl(row.name)}
                                                        </Link>
                                                    )}
                                                    {/* <Link
                                                        variant="subtitle1"
                                                        href={`/product/detail?product_id=${row.id}`}
                                                        underline="hover"
                                                    >
                                                        {shortenUrl(row.name)}
                                                    </Link> */}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link href={`/product/detail?product_id=${row.id}`}>
                                                        {
                                                            // eslint-disable-next-line no-nested-ternary
                                                            url ? (
                                                                getMediaType(url) === 'image' ? (
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
                                                                            key={url}
                                                                            src={url}
                                                                            width="50px"
                                                                            alt={row.name}
                                                                            style={{
                                                                                border: '1px solid lightgrey',
                                                                                borderRadius: '8px',
                                                                                aspectRatio: '1',
                                                                                zIndex: 9999
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                ) : (
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
                                                                        <video
                                                                            key={url}
                                                                            muted
                                                                            loop
                                                                            autoPlay
                                                                            playsInline
                                                                            height={50}
                                                                            style={{
                                                                                objectFit: 'cover',
                                                                                border: '1px solid lightgrey',
                                                                                borderRadius: '8px',
                                                                                aspectRatio: '1',
                                                                                zIndex: 9999
                                                                            }}
                                                                        >
                                                                            <source key={url} src={url} />
                                                                        </video>
                                                                    </Box>
                                                                )
                                                            ) : (
                                                                <>No media</>
                                                            )
                                                        }
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {editing[index] && (
                                                        <TextField
                                                            size="small"
                                                            type="text"
                                                            defaultValue={row.source_url}
                                                            onChange={(e) => handleProductSourceURLChange(e.target.value)}
                                                        />
                                                    )}
                                                    {!editing[index] && (
                                                        <Link
                                                            variant="subtitle1"
                                                            href={`${row.source_url}`}
                                                            target="_blank"
                                                            underline="hover"
                                                        >
                                                            {shortenUrl(row.source_url)}
                                                        </Link>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {editing[index] && (
                                                        <TextField
                                                            size="small"
                                                            type="number"
                                                            defaultValue={row.variants.filter((item) => item.is_active)[0]?.inventory.price}
                                                            onChange={(e) => handlePriceChange(e.target.value)}
                                                        />
                                                    )}
                                                    {!editing[index] && (
                                                        <Typography>
                                                            {row.variants.filter((item) => item.is_active)[0]?.inventory.price}
                                                        </Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <CustomSwitch
                                                        isActive={checkIsSoldOut(row.variants)}
                                                        handleUpdate={(isSoldOut) => {
                                                            handleProductSoldOut(isSoldOut, row.id);
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {editing[index] && myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                                                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                            <DateTimePicker
                                                                slotProps={{ textField: { variant: 'outlined', size: 'small' } }}
                                                                // label="Date & Time"
                                                                value={newPublishDate}
                                                                onChange={(newValue) => {
                                                                    setNewPublishDate(newValue);
                                                                }}
                                                            />
                                                        </LocalizationProvider>
                                                    ) : (
                                                        <Typography>{new Date(row.published_at).toLocaleString()}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {!editing[index] && (
                                                        <>
                                                            <Tooltip placement="top" title="Edit">
                                                                <IconButton
                                                                    color="primary"
                                                                    sx={{
                                                                        color: theme.palette.primary.dark,
                                                                        borderColor: theme.palette.primary.main,
                                                                        '&:hover ': { background: theme.palette.primary.light }
                                                                    }}
                                                                    size="large"
                                                                    onClick={() => handleEditClick(index, row)}
                                                                >
                                                                    <EditIcon sx={{ fontSize: '1.1rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                            {myInfo && myInfo.role && myInfo.role.name === 'super_user' && (
                                                                <Tooltip placement="top" title="Delete">
                                                                    <IconButton
                                                                        color="error"
                                                                        size="large"
                                                                        onClick={() => handleDelete(row)}
                                                                    >
                                                                        <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </>
                                                    )}
                                                    {editing[index] && (
                                                        <>
                                                            <Tooltip placement="top" title="Confirm">
                                                                <IconButton
                                                                    color="success"
                                                                    size="large"
                                                                    onClick={() => handleConfirmClick(index)}
                                                                    aria-label="Confirm"
                                                                >
                                                                    <CheckIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip placement="top" title="Cancel">
                                                                <IconButton
                                                                    color="error"
                                                                    size="large"
                                                                    onClick={() => handleCancelClick(index)}
                                                                    aria-label="Cancel"
                                                                >
                                                                    <CloseIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
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

export default CurationLists;
