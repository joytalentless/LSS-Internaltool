import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import {
    Box,
    Button,
    CardContent,
    CircularProgress,
    Divider,
    Grid,
    Stack,
    TextField,
    Toolbar,
    Tooltip,
    Typography,
    Checkbox,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableSortLabel,
    TableRow,
    Link,
    Select,
    MenuItem,
    InputAdornment,
    OutlinedInput,
    FormControlLabel
} from '@mui/material';
import '@mui/lab';
import { visuallyHidden } from '@mui/utils';

// project imports
import { gridSpacing } from 'store/constant';
import InputLabel from 'ui-component/extended/Form/InputLabel';
import MainCard from 'ui-component/cards/MainCard';

// third-party
import * as yup from 'yup';
import { useFormik } from 'formik';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';

// assets
// import DeleteIcon from '@mui/icons-material/Delete';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { useTheme } from '@mui/system';
import { IconSearch } from '@tabler/icons';
import { getMediaType } from 'utils/formatString';
import useAuth from 'hooks/useAuth';
// yup validation-schema
const validationSchema = yup.object({
    name: yup.string().required('category is Required'),
    description: yup.string().required('description is Required')
});

// ==============================|| VARIATION DETAILS ||============================== //

function CategoryDetail() {
    const { user: myInfo } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isNewPage, SetIsNewPage] = useState(true);

    const [isLoading, setIsLoading] = React.useState(false);
    // For pagenation
    const [order, setOrder] = React.useState('desc');
    const [orderBy, setOrderBy] = React.useState('modified_at');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);
    const [totalCount, setTotalCount] = React.useState(0);

    // For select row
    const [selected, setSelected] = React.useState([]);
    // const [selectedValue, setSelectedValue] = React.useState([]);
    const [categoryList, setCategoryList] = React.useState([]);
    const [currentCategory, setCurrentCategory] = React.useState(0);
    const [selectedSuperAll, setSelectedSuperAll] = React.useState(false);
    const [searchProductHasMedia, setSearchProductHasMedia] = React.useState(0);
    const [searchProductActive, setSearchProductActive] = React.useState(0);
    const [searchProductSoldOut, setSearchProductSoldOut] = React.useState(0);

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

    const queryParams = new URLSearchParams(location.search);
    const categoryID = queryParams.get('category_id');

    const formik = useFormik({
        initialValues: {
            name: ' ',
            description: ' '
        },
        validationSchema,
        onSubmit: async (values) => {
            if (values) {
                if (isNewPage) {
                    try {
                        await axios.post('/categories/', { name: values.name, description: values.description });
                        dispatch(
                            openSnackbar({
                                open: true,
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                message: 'Creating ProductType is succeeded!',
                                variant: 'alert'
                            })
                        );
                        navigate(`/category/list`);
                    } catch (err) {
                        dispatch(
                            openSnackbar({
                                open: true,
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                message: err.error,
                                variant: 'alert',
                                alert: {
                                    color: 'primary'
                                }
                            })
                        );
                    }
                } else {
                    try {
                        await axios.put(`/categories/${categoryID}/`, {
                            name: values.name,
                            description: values.description
                        });
                        dispatch(
                            openSnackbar({
                                open: true,
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                message: 'Updating ProductType is succeeded!',
                                variant: 'alert'
                            })
                        );
                        navigate(`/category/list`);
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
            }
        }
    });

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
                        search: searchKeyWord,
                        category_id: categoryID,
                        has_media: hasMedia,
                        is_active: isActive,
                        is_soldout: isSoldOut
                    }
                })
                .then((resData) => {
                    const productList = resData.data.results.map((productData) => ({
                        ...productData,
                        category: productData.category ? productData.category.name : undefined,
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
        [page, rowsPerPage, order, orderBy, searchProductHasMedia, searchProductActive, searchProductSoldOut]
    );

    useEffect(() => {
        fetchProducts(search);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetchProducts]);

    useEffect(() => {
        if (categoryID) {
            SetIsNewPage(false);
            fetchProducts();
            // eslint-disable-next-line no-inner-declarations
            async function fetchCategoryDetail() {
                try {
                    const response = await axios.get(`/categories/?is_active=true`);
                    const categories = response.data.map((item) => ({
                        name: item.name,
                        id: item.id
                    }));
                    setCurrentCategory(response.data.filter((item) => item.id === parseInt(categoryID, 10))[0].id);
                    setCategoryList(categories);
                    const res = await axios.get(`/categories/${categoryID}/`);
                    formik.setValues({
                        name: res.data.name,
                        description: res.data.description
                    });
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
        } else {
            SetIsNewPage(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
        // setPage(0);
    };

    const handleSelectAllClick = (event) => {
        setSelectedSuperAll(false);
        if (event.target.checked) {
            if (selected.length > 0) {
                setSelected([]);
            } else {
                const newSelectedId = rows.map((n) => n.id);
                setSelected(newSelectedId);
            }
            return;
        }
        setSelected([]);
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

    const handleClick = (event, productId) => {
        const selectedIndex = selected.indexOf(productId);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, productId);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }
        // const selectedRowData = rows.filter((row) => newSelected.includes(row.id));
        // setSelectedValue(selectedRowData);
        setSelected(newSelected);
        setSelectedSuperAll(false);
    };

    const handleMultiUpdate = (updateData) => {
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

            axios
                .put('/products/bulk-update', {
                    ...updateData,
                    product_ids: selected,
                    is_selected_all: selectedSuperAll,
                    src_has_media: hasMedia,
                    src_is_active: isActive,
                    src_is_soldout: isSoldOut,
                    src_category_id: categoryID,
                    search
                })
                .then((resData) => {
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
        <>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <MainCard title={isNewPage ? 'New Category' : 'Update Category'} content={false}>
                        <CardContent>
                            <form onSubmit={formik.handleSubmit}>
                                <Grid container spacing={gridSpacing}>
                                    <Grid item xs={12} md={4}>
                                        <Stack>
                                            <InputLabel required>Category Name</InputLabel>
                                            <TextField
                                                fullWidth
                                                id="name"
                                                name="name"
                                                value={formik.values.name || ''}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.name && Boolean(formik.errors.name)}
                                                helperText={formik.touched.name && formik.errors.name}
                                                placeholder="USD"
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={8}>
                                        <Stack>
                                            <InputLabel required>Description</InputLabel>
                                            <TextField
                                                fullWidth
                                                id="description"
                                                name="description"
                                                value={formik.values.description || ''}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                error={formik.touched.description && Boolean(formik.errors.description)}
                                                helperText={formik.touched.description && formik.errors.description}
                                                placeholder="USD"
                                            />
                                        </Stack>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                    <Grid item sx={{ display: 'flex', justifyContent: 'flex-end' }} xs={12}>
                                        <Button variant="contained" type="submit">
                                            {isNewPage ? 'Add New Category' : 'Update Category'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </form>
                        </CardContent>
                    </MainCard>
                    <br />
                    <MainCard
                        content={false}
                        title="Related Product List"
                        secondary={
                            <Stack direction="row" spacing={2} alignItems="center">
                                {/* <CSVExport data={selectedValue.length > 0 ? selectedValue : rows} filename="enhanced-table.csv" header={header} />
                                <SecondaryAction link="https://next.material-ui.com/components/tables/" /> */}
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
                            </Stack>
                        }
                    >
                        <Grid
                            item
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 1,
                                marginTop: '20px',
                                padding: '24px'
                            }}
                        >
                            <Grid
                                item
                                xs={6}
                                md={6}
                                sm={3}
                                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}
                            >
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            onChange={() => setSelectedSuperAll(!selectedSuperAll)}
                                            value={selectedSuperAll}
                                            checked={selectedSuperAll}
                                            color="primary"
                                        />
                                    }
                                    label={selectedSuperAll ? 'Clear selection' : `Select All ${totalCount} items`}
                                    labelPlacement="end"
                                />
                            </Grid>
                            <Grid item xs={6} sm={6} sx={{ display: 'flex', flexDirection: 'row', gap: 3 }}>
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
                        </Grid>
                        <EnhancedTableToolbar
                            numSelected={selectedSuperAll ? totalCount : selected.length}
                            handleMultiUpdate={(UpdateData) => handleMultiUpdate(UpdateData)}
                            categories={categoryList}
                            currentCategory={currentCategory}
                        />

                        {/* table */}
                        <TableContainer sx={{ overflow: 'visible' }}>
                            {isLoading ? (
                                <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                    <CircularProgress aria-label="progress" />
                                </Grid>
                            ) : (
                                <Table sx={{ minWidth: 750, overflow: 'visible' }} aria-labelledby="tableTitle" size="medium">
                                    <EnhancedTableHead
                                        numSelected={selected.length}
                                        order={order}
                                        orderBy={orderBy}
                                        onSelectAllClick={handleSelectAllClick}
                                        onRequestSort={handleRequestSort}
                                        rowCount={rows.length}
                                    />
                                    <TableBody sx={{ overflow: 'visible' }}>
                                        {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                                            if (typeof row === 'number') return null;
                                            const isItemSelected = isSelected(row.id);
                                            const labelId = `enhanced-table-checkbox-${index}`;
                                            const variant = row.variants
                                                .filter((item) => item.is_active)
                                                .sort((a, b) => a.index - b.index)[0];
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
                                                    onClick={(event) => handleClick(event, row.id)}
                                                    role="checkbox"
                                                    aria-checked={isItemSelected}
                                                    tabIndex={-1}
                                                    key={row.id}
                                                    selected={isItemSelected}
                                                >
                                                    <TableCell sx={{ pl: 3 }} padding="checkbox">
                                                        <Checkbox
                                                            color="primary"
                                                            checked={isItemSelected}
                                                            inputProps={{
                                                                'aria-labelledby': labelId
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell sx={{ pl: 3, textAlign: 'center' }}>
                                                        <Link
                                                            href={`/product/detail?product_id=${row.id}`}
                                                            underline="hover"
                                                            sx={{ fontWeight: 'bold' }}
                                                        >
                                                            {row.id}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ pl: 3 }}>
                                                        <Typography align="center">{row.name}</Typography>
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
                                                    <TableCell sx={{ pl: 3 }}>
                                                        <Typography align="center">{row.is_active ? 'active' : 'deactive'}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{row.created_at}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{row.modified_at}</TableCell>
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
                            count={totalCount}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </MainCard>
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
        </>
    );
}

export default CategoryDetail;

// table header
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
        id: 'isActive',
        numeric: false,
        label: 'Active Status',
        align: 'center'
    },
    {
        id: 'created_at',
        numeric: true,
        label: 'Created',
        align: 'center'
    },
    {
        id: 'modified_at',
        numeric: true,
        label: 'Last Updated',
        align: 'center'
    }
];

// ==============================|| TABLE - HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox" sx={{ pl: 3 }}>
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts'
                        }}
                    />
                </TableCell>
                <TableCell align="center">Product ID</TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align="center"
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : undefined}
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
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
};

// ==============================|| TABLE - TOOLBAR ||============================== //

const EnhancedTableToolbar = ({ numSelected, handleMultiUpdate, categories, currentCategory }) => {
    const theme = useTheme();
    const [isActive, setIsActive] = React.useState(false);
    const [isSoldOut, setIsSoldOut] = React.useState(false);
    const [category, setCategory] = React.useState(currentCategory);

    useEffect(() => {
        if (currentCategory) setCategory(currentCategory);
    }, [currentCategory]);

    const handleMultiChangeCategory = useCallback(() => {
        const UpdateData = {
            dst_category_id: category,
            dst_is_active: isActive,
            dst_is_soldout: isSoldOut
        };
        handleMultiUpdate(UpdateData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, isActive, isSoldOut]);

    useEffect(() => {
        handleMultiChangeCategory();
    }, [handleMultiChangeCategory]);

    const handleChangeCategory = (value) => {
        setCategory(value);
    };

    const handleChangeActive = (value) => {
        setIsActive(value);
    };

    const handleChangeSoldOut = (value) => {
        setIsSoldOut(value);
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
            {numSelected > 0 ? (
                <Typography color="inherit" variant="subtitle1">
                    {numSelected} {numSelected === 1 ? 'item' : 'items'} selected
                </Typography>
            ) : (
                <Typography variant="h5" id="tableTitle">
                    You can select multiple products and can edit them.
                </Typography>
            )}
            <Box sx={{ flexGrow: 1 }} />
            {numSelected > 0 && (
                <Box display="flex" gap={2} justifyContent="center">
                    <Stack width={120} justifyContent="center">
                        <Select
                            fullWidth
                            id="category"
                            name="category"
                            size="small"
                            placeholder="Category"
                            value={category || ''}
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

                    <Tooltip title="Not SolOut">
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

                    <Tooltip title="SolOut">
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
                    {/* <Tooltip title="Delete">
                        <IconButton size="medium" onClick={handleMultiDelete}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip> */}
                </Box>
            )}
        </Toolbar>
    );
};

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired,
    handleMultiUpdate: PropTypes.func.isRequired,
    categories: PropTypes.array.isRequired,
    currentCategory: PropTypes.number.isRequired
};
