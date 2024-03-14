import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
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
    TableSortLabel,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Toolbar,
    Tooltip,
    Typography,
    FormControlLabel,
    Switch,
    Select,
    MenuItem,
    Stack,
    Autocomplete,
    TextField
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import MainCard from 'ui-component/cards/MainCard';

// assets
import { IconSearch } from '@tabler/icons';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { getMediaType } from 'utils/formatString';
import { openSnackbar } from 'store/slices/snackbar';
import SetPriceModal from 'ui-component/SetPriceModal';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import useAuth from 'hooks/useAuth';

// table header options
const headCells = [
    {
        id: 'name',
        numeric: false,
        label: 'Name',
        align: 'center'
    },
    {
        id: 'media',
        numeric: false,
        label: 'Media',
        align: 'center'
    },
    {
        id: 'source_url',
        numeric: false,
        label: 'Source URL',
        align: 'center'
    },
    {
        id: 'videosourceurl',
        numeric: false,
        label: 'Video Source URL',
        align: 'center'
    },
    {
        id: 'published_at',
        numeric: true,
        label: 'Last Published',
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
                <TableCell align="center">Product ID</TableCell>
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
                    Need Video
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

// ==============================|| TABLE - TOOLBAR ||============================== //

const EnhancedTableToolbar = ({ numSelected, handleMultiUpdate, categories }) => {
    const theme = useTheme();

    const [selectedCategory, setSelectedCategory] = React.useState(1);
    const [isPriceDialogOpen, setIsPriceDialogOpen] = React.useState(false);

    const handleMultiDelete = () => {
        handleMultiUpdate({ dst_is_deleted: true });
    };

    const handleChangeCategory = (category) => {
        handleMultiUpdate({ dst_category_id: category });
        setSelectedCategory(category);
    };

    const handleChangeActive = (active) => {
        handleMultiUpdate({ dst_is_active: active });
    };

    const handleChangeSoldOut = (soldout) => {
        handleMultiUpdate({ dst_is_soldout: soldout });
    };

    const handleOpenSetPrice = () => {
        setIsPriceDialogOpen(true);
    };

    const handleCloseSetPrice = () => {
        setIsPriceDialogOpen(false);
    };

    const openSuccess = () => {
        dispatch(
            openSnackbar({
                open: true,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                message: 'The price has been set successfully!',
                variant: 'alert',
                alert: {
                    color: 'success'
                }
            })
        );
    };

    return (
        <Toolbar
            sx={{
                p: 0,
                pl: 1,
                pr: 1,
                ...(numSelected > 0 && {
                    color: (theme) => theme.palette.secondary.main,
                    background: (theme) => theme.palette.secondary.light
                })
            }}
        >
            <Box sx={{ flexGrow: 1 }} />
            {numSelected > 0 && (
                <>
                    <Box display="flex" gap={2} justifyContent="center">
                        <Tooltip title="Set price">
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={handleOpenSetPrice}
                                color="warning"
                                startIcon={<PriceChangeIcon sx={{ color: theme.palette.error.main }} />}
                            >
                                Set price
                            </Button>
                        </Tooltip>

                        <Stack width={120} justifyContent="center">
                            <Select
                                fullWidth
                                id="category"
                                name="category"
                                size="small"
                                displayEmpty
                                value={selectedCategory || ''}
                                renderValue={selectedCategory !== 1 ? undefined : () => <em>Category</em>}
                                onChange={(e) => handleChangeCategory(e.target.value)}
                            >
                                {categories.map((category, index) => (
                                    <MenuItem key={index} value={category.id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </Stack>

                        <Tooltip title="Deactive">
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => handleChangeActive(false)}
                                color="primary"
                                startIcon={<LightbulbOutlinedIcon sx={{ color: theme.palette.error.main }} />}
                            >
                                Deactive
                            </Button>
                        </Tooltip>

                        <Tooltip title="Active">
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => handleChangeActive(true)}
                                color="info"
                                startIcon={<TipsAndUpdatesIcon sx={{ color: theme.palette.warning.main }} />}
                            >
                                Active
                            </Button>
                        </Tooltip>

                        <Tooltip title="Not Sold Out">
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => handleChangeSoldOut(false)}
                                color="primary"
                                startIcon={<LightbulbOutlinedIcon sx={{ color: theme.palette.error.main }} />}
                            >
                                Not SoldOut
                            </Button>
                        </Tooltip>

                        <Tooltip title="Sold Out">
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={() => handleChangeSoldOut(true)}
                                color="info"
                                startIcon={<TipsAndUpdatesIcon sx={{ color: theme.palette.warning.main }} />}
                            >
                                SoldOut
                            </Button>
                        </Tooltip>

                        <Tooltip title="Delete">
                            <Button
                                variant="contained"
                                size="medium"
                                onClick={handleMultiDelete}
                                color="secondary"
                                startIcon={<DeleteForeverIcon sx={{ color: theme.palette.error.main }} />}
                            >
                                Delete
                            </Button>
                        </Tooltip>
                    </Box>

                    <SetPriceModal
                        openModal={isPriceDialogOpen}
                        handleClose={handleCloseSetPrice}
                        handleUpdatePrices={handleMultiUpdate}
                        openSuccess={openSuccess}
                    />
                </>
            )}
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
    handleMultiUpdate: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired
};

// ==============================|| USER LIST ||============================== //

const VideoLists = () => {
    const { user: myInfo } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('modified_at');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [sourceURL, setSourceURL] = React.useState('');
    const [rows, setRows] = React.useState([]);
    const [selected, setSelected] = React.useState([]);
    const [selectedSuperAll, setSelectedSuperAll] = React.useState(false);
    const [totalCount, setTotalCount] = React.useState(0);
    const [categoryList, setCategoryList] = React.useState([]);
    const [productTypes, setProductTypes] = React.useState([{ value: 0, label: 'All Category' }]);
    const [searchProductHasMedia, setSearchProductHasMedia] = React.useState(0);
    const [searchProductActive, setSearchProductActive] = React.useState(0);
    const [searchProductSoldOut, setSearchProductSoldOut] = React.useState(0);
    const [searchProductType, setSearchProductType] = React.useState(0);

    const productHasMediaTypes = [
        { value: 0, label: 'Has/No Image' },
        { value: 1, label: 'Has Image' },
        { value: 2, label: 'No Image' }
    ];
    const productActiveTypes = [
        { value: 0, label: 'Active/Inactive' },
        { value: 1, label: 'Active' },
        { value: 2, label: 'Inactive' }
    ];
    const productSoldOutTypes = [
        { value: 0, label: 'SoldOut/Not SoldOut' },
        { value: 1, label: 'SoldOut' },
        { value: 2, label: 'Not SoldOut' }
    ];
    const sourceURLTypes = [
        { value: 'all', label: 'All' },
        { value: 'none', label: 'None' },
        { value: 'justinreed.com', label: 'justinreed.com' },
        { value: 'demischdanant.com', label: 'demischdanant.com' },
        { value: 'manhattanmotorcars.com', label: 'manhattanmotorcars.com' },
        { value: 'classic-chrome', label: 'classic-chrome' },
        { value: 'supremestickers', label: 'supremestickers' },
        { value: 'lefleurprops', label: 'lefleurprops' },
        { value: 'middlemanstore', label: 'middlemanstore' },
        { value: 'gagosianshop', label: 'gagosianshop' },
        { value: 'devisenyc', label: 'devisenyc' },
        { value: 'rakitecht', label: 'rakitecht' },
        { value: 'lukes.store', label: 'lukes.store' },
        { value: 'anyrare', label: 'anyrare' },
        { value: 'mahshu', label: 'mahshu' },
        { value: 'lavintage', label: 'lavintage' },
        { value: 'hyman', label: 'hyman' },
        { value: 'uncrate', label: 'uncrate' },
        { value: 'sothebys', label: 'sothebys' }
    ];

    const handleSuperAllSelected = useCallback(() => {
        if (selectedSuperAll) {
            const newSelectedId = rows.map((n) => n.id);
            setSelected(newSelectedId);
        } else {
            setSelected([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSuperAll]);

    useEffect(() => {
        handleSuperAllSelected();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handleSuperAllSelected]);

    const fetchProducts = useCallback(
        (searchKeyWord) => {
            let hasMedia;
            let isActive;
            let isSoldOut;
            if (searchProductHasMedia === 0) {
                hasMedia = '';
            } else if (searchProductHasMedia === 1) {
                hasMedia = true;
            } else {
                hasMedia = false;
            }
            if (searchProductActive === 0) {
                isActive = '';
            } else if (searchProductActive === 1) {
                isActive = true;
            } else {
                isActive = false;
            }
            if (searchProductSoldOut === 0) {
                isSoldOut = '';
            } else if (searchProductSoldOut === 1) {
                isSoldOut = true;
            } else {
                isSoldOut = false;
            }
            setIsLoading(true);
            axios
                .get('/products/', {
                    params: {
                        p: page + 1,
                        order_by: orderBy,
                        desc: order !== 'asc',
                        page_size: rowsPerPage,
                        has_media: hasMedia,
                        is_active: isActive,
                        is_soldout: isSoldOut,
                        source_url: sourceURL,
                        category_id: searchProductType,
                        search: searchKeyWord,
                        is_videoneed: true
                    }
                })
                .then((resData) => {
                    const productList = resData.data.results.map((productData) => ({
                        ...productData,
                        category: productData.category ? productData.category.name : 'Null',
                        created_at: new Date(productData.created_at).toLocaleString(),
                        modified_at: new Date(productData.modified_at).toLocaleString()
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
        [page, sourceURL, rowsPerPage, order, orderBy, searchProductHasMedia, searchProductActive, searchProductSoldOut, searchProductType]
    );

    useEffect(() => {
        fetchProducts(search, sourceURL);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProducts]);

    useEffect(() => {
        // eslint-disable-next-line no-inner-declarations
        async function fetchCategoryDetail() {
            try {
                const response = await axios.get(`/categories/?is_active=true`);
                const categories = response.data.map((item) => ({
                    name: item.name,
                    id: item.id
                }));
                categories.unshift({ name: 'Null', id: -1 });
                setCategoryList(categories);

                const productTypeList = response.data.map((item) => ({ value: item.id, label: item.name }));
                productTypeList.unshift({ value: 0, label: 'All Category' }, { value: -1, label: 'Null Category' });
                setProductTypes(productTypeList);
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
        fetchCategoryDetail();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
        // setPage(0);
    };

    const handleSourceURL = (value) => {
        setSourceURL(value || '');
        setPage(0);
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

    const shortenUrl = (longUrl) => {
        const maxDisplayChars = 30;
        return longUrl?.length > maxDisplayChars ? `${longUrl.substring(0, maxDisplayChars)}...` : longUrl;
    };

    const handleProductNeedVideo = async (newVideoNeedStatus, productId) => {
        try {
            await axios.put(`/products/${productId}/`, { is_videoneed: newVideoNeedStatus });
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

    const handleMultiUpdate = async (updateData) => {
        try {
            if (selected.length > 0) {
                let hasMedia;
                let isActive;
                let isSoldOut;
                if (searchProductHasMedia === 0) {
                    hasMedia = '';
                } else if (searchProductHasMedia === 1) {
                    hasMedia = true;
                } else {
                    hasMedia = false;
                }
                if (searchProductActive === 0) {
                    isActive = '';
                } else if (searchProductActive === 1) {
                    isActive = true;
                } else {
                    isActive = false;
                }
                if (searchProductSoldOut === 0) {
                    isSoldOut = '';
                } else if (searchProductSoldOut === 1) {
                    isSoldOut = true;
                } else {
                    isSoldOut = false;
                }

                const resData = await axios.put('/products/bulk-update', {
                    ...updateData,
                    product_ids: selected,
                    is_selected_all: selectedSuperAll,
                    src_has_media: hasMedia,
                    src_is_active: isActive,
                    src_is_soldout: isSoldOut,
                    source_url: sourceURL,
                    src_category_id: searchProductType,
                    search
                });
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: resData.data.message,
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        }
                    })
                );
                setSelected([]);
                setSelectedSuperAll(false);
                fetchProducts();
            }
        } catch (error) {
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
            throw new Error(error);
        }
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

    const isSelected = (id) => selected.indexOf(id) !== -1;

    return (
        <MainCard title="Product List Which Needs Video" content={false}>
            {myInfo && myInfo.role && (myInfo.role.name === 'super_user' || myInfo.role.name === 'video_upload') ? (
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
                            <Grid container alignItems="center" justifyContent="space-between" width="70%">
                                <Grid item xs={6} sm={2.5}>
                                    {/* <OutlinedInput
                                        id="input-search-list-style1"
                                        placeholder="Source URL"
                                        startAdornment={
                                            <InputAdornment position="start">
                                                <IconSearch stroke={1.5} size="16px" />
                                            </InputAdornment>
                                        }
                                        size="small"
                                        onChange={handleSourceURL}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') fetchProducts(search);
                                        }}
                                        value={sourceURL}
                                    /> */}
                                    <Autocomplete
                                        freeSolo
                                        id="free-solo-2-demo"
                                        disableClearable
                                        options={sourceURLTypes.map((option) => option.label)}
                                        size="small"
                                        sx={{ paddingBottom: '8px' }}
                                        onChange={(e) => {
                                            if (e.target.value.length) {
                                                handleSourceURL(e.target.value || '');
                                            } else {
                                                handleSourceURL(
                                                    sourceURLTypes.filter((item) => item.label === e.target.innerText)[0].value || ''
                                                );
                                            }
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder="Source URL"
                                                margin="normal"
                                                InputProps={{
                                                    ...params.InputProps,
                                                    type: 'search'
                                                }}
                                                // onSelect={(e) => {
                                                //     fetchProducts(search, e.target.value);
                                                // }}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') handleSourceURL(e.target.value);
                                                }}
                                            />
                                        )}
                                    />
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Select
                                        size="small"
                                        fullWidth
                                        id="productHasMediaType"
                                        name="productHasMediaType"
                                        placeholder="Media"
                                        value={searchProductHasMedia}
                                        onChange={(e) => {
                                            setSearchProductHasMedia(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        {productHasMediaTypes.map((category, index) => (
                                            <MenuItem key={index} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Select
                                        size="small"
                                        fullWidth
                                        id="productActiveType"
                                        name="productActiveType"
                                        placeholder="Active"
                                        value={searchProductActive}
                                        onChange={(e) => {
                                            setSearchProductActive(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        {productActiveTypes.map((category, index) => (
                                            <MenuItem key={index} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Select
                                        size="small"
                                        fullWidth
                                        id="productSoldOutType"
                                        name="productSoldOutType"
                                        placeholder="SoldOut"
                                        value={searchProductSoldOut}
                                        onChange={(e) => {
                                            setSearchProductSoldOut(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        {productSoldOutTypes.map((category, index) => (
                                            <MenuItem key={index} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                                <Grid item xs={6} sm={2}>
                                    <Select
                                        size="small"
                                        fullWidth
                                        id="productType"
                                        name="productType"
                                        placeholder="Category"
                                        value={searchProductType}
                                        onChange={(e) => {
                                            setSearchProductType(e.target.value);
                                            setPage(0);
                                        }}
                                    >
                                        {productTypes.map((category, index) => (
                                            <MenuItem key={index} value={category.value}>
                                                {category.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </Grid>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <EnhancedTableToolbar
                        numSelected={selectedSuperAll ? totalCount : selected.length}
                        handleMultiUpdate={(UpdateData) => handleMultiUpdate(UpdateData)}
                        categories={categoryList}
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
                                        const isItemSelected = isSelected(row.id);
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
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={row.id}
                                                selected={isItemSelected}
                                            >
                                                <TableCell sx={{ pl: 3, textAlign: 'center' }}>
                                                    <Link href={`/product/detail?product_id=${row.id}`} underline="hover">
                                                        {row.id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link href={`/product/detail?product_id=${row.id}`} underline="hover">
                                                        {row.name}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link href={`/product/detail?product_id=${row.id}`} fontWeight="bold">
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
                                                {/* <TableCell sx={{ textAlign: 'center' }}>{row.created_at}</TableCell> */}
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Link href={row.source_url} target="_blank" variant="subtitle1" color="primary">
                                                            {shortenUrl(row.source_url)}
                                                        </Link>
                                                        {row.source_url && (
                                                            <Tooltip placement="top" title="Copy Source URL">
                                                                <IconButton
                                                                    color="info"
                                                                    size="medium"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(row.source_url);
                                                                    }}
                                                                    sx={{ marginLeft: '5px' }}
                                                                >
                                                                    <ContentCopyIcon sx={{ width: 20, height: 20 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                        <Link href={row.videosourceurl} target="_blank" variant="subtitle1" color="primary">
                                                            {shortenUrl(row.videosourceurl)}
                                                        </Link>
                                                        {row.videosourceurl && (
                                                            <Tooltip placement="top" title="Copy Video Source URL">
                                                                <IconButton
                                                                    color="info"
                                                                    size="medium"
                                                                    onClick={() => {
                                                                        navigator.clipboard.writeText(row.videosourceurl);
                                                                    }}
                                                                    sx={{ marginLeft: '5px' }}
                                                                >
                                                                    <ContentCopyIcon sx={{ width: 20, height: 20 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        )}
                                                    </Grid>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {row.published_at ? new Date(row.published_at).toLocaleString() : ''}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <CustomSwitch
                                                        isActive={row.is_videoneed}
                                                        handleUpdate={(isVideoNeed) => {
                                                            handleProductNeedVideo(isVideoNeed, row.id);
                                                        }}
                                                    />
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

export default VideoLists;

export const CustomSwitch = ({ isActive, handleUpdate }) => {
    const [productActive, setProductActive] = React.useState(false);

    useEffect(() => {
        setProductActive(isActive);
    }, [isActive]);

    return (
        <FormControlLabel
            value="end"
            control={
                <Switch
                    onChange={() => {
                        handleUpdate(!productActive);
                        setProductActive(!productActive);
                    }}
                    value={productActive}
                    color="primary"
                />
            }
            checked={productActive}
            label={productActive ? 'On' : 'Off'}
            labelPlacement="end"
        />
    );
};

CustomSwitch.propTypes = {
    isActive: PropTypes.bool.isRequired,
    handleUpdate: PropTypes.func.isRequired
};

const CustomSelect = ({ categoryList, defaultCategory, onUpdate }) => {
    const [category, setCategory] = React.useState(-1);
    const [categoryId, setCategoryId] = React.useState(0);

    useEffect(() => {
        if (defaultCategory) {
            setCategory(defaultCategory);
        }
        if (categoryList.length > 0) {
            setCategoryId(categoryList.filter((item) => item.name === category)[0]?.id);
        }
    }, [defaultCategory, categoryList, category]);

    return (
        <Select
            fullWidth
            size="small"
            id="productType"
            name="productType"
            placeholder="Category"
            value={categoryId || ''}
            onChange={(e) => {
                setCategoryId(e.target.value);
                onUpdate(e.target.value);
            }}
        >
            {categoryList.map((item, index) => (
                <MenuItem key={index} value={item.id}>
                    {item.name}
                </MenuItem>
            ))}
        </Select>
    );
};

CustomSelect.propTypes = {
    categoryList: PropTypes.array.isRequired,
    defaultCategory: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired
};
