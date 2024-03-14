import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Button,
    CardContent,
    Fab,
    Grid,
    IconButton,
    MenuItem,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableSortLabel,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Tooltip,
    Typography,
    Divider,
    Switch,
    FormControlLabel,
    FormLabel
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import InputLabel from 'ui-component/extended/Form/InputLabel';
import MainCard from 'ui-component/cards/MainCard';

import AddIcon from '@mui/icons-material/AddTwoTone';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import LaunchIcon from '@mui/icons-material/Launch';

import axios from 'utils/axios';
import { gridSpacing } from 'store/constant';

// third-party
import * as yup from 'yup';
import { useFormik } from 'formik';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';

import VariationDetails from './VariationDetails';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import useAuth from 'hooks/useAuth';

// yup validation-schema
const validationSchema = yup.object({
    productName: yup.string().required('Product name is Required')
});

// table header options
const headCells = [
    {
        id: 'quantity',
        numeric: true,
        label: 'Inventory Count',
        align: 'center'
    },
    {
        id: 'price',
        numeric: true,
        label: 'Price',
        align: 'center'
    },
    {
        id: 'currency',
        numeric: false,
        label: 'Currency',
        align: 'center'
    },
    {
        id: 'index',
        numeric: true,
        label: 'Index',
        align: 'center'
    },
    {
        id: 'shipping_cost',
        numeric: true,
        label: 'Shipping Cost',
        align: 'center'
    },
    {
        id: 'total_cost',
        numeric: true,
        label: 'Total Cost',
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
                <TableCell sx={{ pl: 3 }}>#</TableCell>
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
    order: PropTypes.node,
    orderBy: PropTypes.node,
    onRequestSort: PropTypes.func
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

const ProductDetail = () => {
    const { user: myInfo } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [productId, setProductID] = React.useState(null);
    const theme = useTheme();
    const dispatch = useDispatch();

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        setProductID(searchParams.get('product_id'));
    }, [location]);

    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const [productDetail, setProductDetail] = React.useState(null);
    const [productTypes, setProductTypes] = React.useState([]);
    const [productSubTypes, setProductSubTypes] = React.useState([]);
    const [rows, setRows] = React.useState([]);
    const [variationID, setVariationID] = React.useState(undefined);
    const [publishedAt, setPublishedAt] = React.useState(new Date());
    const [isEdit, setIsEdit] = React.useState(false);
    const [productActive, setProductActive] = React.useState(false);
    const [productSoldOut, setProductSoldOut] = React.useState(false);
    const [productVideoNeed, setProductVideoNeed] = React.useState(false);
    const [productNotForSale, setProductNotForSale] = React.useState(false);
    const [childProductData, setChildProductData] = React.useState([]);
    const [childProductID, setChildProductID] = React.useState('');

    const formik = useFormik({
        initialValues: {
            productName: '',
            sourceUrl: '',
            productType: '',
            productSubType: ''
        },
        validationSchema,
        onSubmit: (values) => {
            if (values) {
                if (productId) {
                    // Update product
                    axios
                        .put(`/products/${productId}/`, {
                            name: values.productName,
                            source_url: values.sourceUrl ? values.sourceUrl : undefined,
                            videosourceurl: values.videoSourceUrl ? values.videoSourceUrl : undefined,
                            dst_category_id: values.productType ? values.productType : null,
                            subcategory_id: values.productSubType ? values.productSubType : null
                        })
                        .then(() => {
                            dispatch(
                                openSnackbar({
                                    open: true,
                                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                    message: 'Update is success!',
                                    variant: 'alert'
                                })
                            );
                        })
                        .catch(() => {
                            dispatch(
                                openSnackbar({
                                    open: true,
                                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                    message: 'Update is failed!',
                                    variant: 'alert',
                                    alert: {
                                        color: 'error'
                                    }
                                })
                            );
                        });
                } else {
                    // Create product
                    axios
                        .post('/products/', {
                            name: values.productName,
                            source_url: values.sourceUrl ? values.sourceUrl : undefined,
                            videosourceurl: values.videoSourceUrl ? values.videoSourceUrl : undefined,
                            category_id: values.productType ? values.productType : undefined,
                            subcategory_id: values.productSubType ? values.productSubType : undefined
                        })
                        .then((resData) => {
                            dispatch(
                                openSnackbar({
                                    open: true,
                                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                    message: 'Update is success!',
                                    variant: 'alert'
                                })
                            );
                            navigate(`/product/detail?product_id=${resData.data.id}`);
                        })
                        .catch(() => {
                            dispatch(
                                openSnackbar({
                                    open: true,
                                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                    message: 'Create is failed!',
                                    variant: 'alert',
                                    alert: {
                                        color: 'error'
                                    }
                                })
                            );
                        });
                }
            }
        }
    });

    const fetchData = useCallback(
        async (oldVariationID) => {
            try {
                let resData = await axios.get('/categories/', { params: { is_active: true } });
                const productTypeList = resData.data.map((category) => ({ value: category.id, label: category.name }));
                setProductTypes(productTypeList);

                resData = await axios.get('/subcategories/', { params: { is_active: true } });
                const productSubTypeList = resData.data.map((subcategory) => ({ value: subcategory.id, label: subcategory.name }));
                setProductSubTypes(productSubTypeList);

                let productData;
                if (productId) {
                    resData = await axios.get(`/products/${productId}/`);
                    productData = {
                        ...resData.data,
                        category_id: resData.data.category ? resData.data.category.id : '',
                        created_at: new Date(resData.data.created_at).toLocaleString(),
                        modified_at: new Date(resData.data.modified_at).toLocaleString()
                    };
                    formik.values.productType = resData.data.category ? resData.data.category.id : '';
                    formik.values.productSubType = resData.data.subcategory ? resData.data.subcategory.id : '';
                    formik.values.sourceUrl = resData.data.source_url ? resData.data.source_url : '';
                    setProductDetail(productData);
                    setProductActive(productData.is_active);
                    setProductVideoNeed(productData.is_videoneed);
                    setProductNotForSale(productData.is_notforsale);

                    // set child products if any
                    if (
                        resData.data.category &&
                        resData.data.category.name === 'System' &&
                        resData.data.subcategory &&
                        resData.data.subcategory.name === 'List'
                    ) {
                        resData = await axios.get(`/products/${productId}/childs`);
                        const childProducts = resData.data.map((collection) => ({
                            id: collection.id,
                            product_id: collection.child_product.id,
                            product_name: collection.child_product.name
                        }));
                        setChildProductData(childProducts);
                    }
                    // check if the product is sold out
                    setProductSoldOut(false);
                    const variants = productData.variants;
                    if (variants?.length === 0) setProductSoldOut(true);
                    else if (variants?.length > 0) {
                        for (let i = 0; i < variants.length; i += 1) {
                            const quantity = variants[i]?.inventory ? variants[i]?.inventory.quantity : 0;
                            if (quantity === 0) setProductSoldOut(true);
                        }
                    }
                    setPublishedAt(new Date(productData.published_at || new Date()));
                    if (resData.data) {
                        resData = await axios.get('/variants/', { params: { product_id: productId, is_active: true } });
                        const newRows = resData.data.map((row) => ({
                            ...row,
                            quantity: row.inventory?.quantity,
                            price: row.inventory?.price,
                            currency: row.inventory?.currency
                        }));
                        setRows(newRows);
                        if (oldVariationID) setVariationID(oldVariationID);
                        else setVariationID(newRows.length > 0 ? newRows[0].id : undefined);
                    } else setRows([]);
                }
                formik.values.productName = productId ? productData.name : '';
            } catch (err) {
                console.info(err);
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'Fetch data is failed!',
                        variant: 'alert',
                        alert: {
                            color: 'error'
                        }
                    })
                );
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [productId]
    );

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleProductActive = async (newActiveStatus) => {
        try {
            await axios.put(`/products/${productId}/`, { is_active: newActiveStatus });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product updated successfully!',
                    variant: 'alert'
                })
            );
            setIsEdit(false);
            setProductActive(newActiveStatus);
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

    const handleProductSoldOut = async (newSoldOutStatus) => {
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
            setIsEdit(false);
            setProductSoldOut(newSoldOutStatus);
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

    const handleProductNeedVideo = async (newVideoNeedStatus) => {
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
            setIsEdit(false);
            setProductVideoNeed(newVideoNeedStatus);
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

    const handleProductNotForSale = async (notForSaleStatus) => {
        try {
            await axios.put(`/products/${productId}/`, { is_notforsale: notForSaleStatus });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product updated successfully!',
                    variant: 'alert'
                })
            );
            setIsEdit(false);
            setProductNotForSale(notForSaleStatus);
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

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleAddNewVariation = () => {
        if (productId) setVariationID(undefined);
        else {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Please create product firstly.',
                    variant: 'alert',
                    alert: {
                        color: 'warning'
                    }
                })
            );
        }
    };

    const handleDeleteVariation = async (row) => {
        try {
            await axios.delete(`/variants/${row.id}`);
            const newRows = rows.filter((item) => item.id !== row.id);
            setRows(newRows);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Variat delete succeed!',
                    variant: 'alert'
                })
            );
            if (newRows.length > 0) setVariationID(newRows[0].id);
            else setVariationID(undefined);
        } catch (err) {
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
        }
    };

    const onEditTimeStamp = () => {
        setIsEdit(true);
    };

    const handlePublish = async () => {
        // check variants with no media, if any, show error
        const variantEmptyMedias = productDetail.variants.filter((variant) => {
            if (variant.media.length === 0) return true;
            let hasIsActive = false;
            for (let i = 0; i < variant.media.length; i += 1) {
                if (variant.media[i].is_active) {
                    hasIsActive = true;
                    break;
                }
            }
            if (!hasIsActive) return true;
            return false;
        });
        if (variantEmptyMedias.length > 0) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Some variant(s) with no media',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
            return;
        }

        try {
            await axios.put(`/products/${productId}/`, { is_published: true, published_at: publishedAt });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Published successfully!',
                    variant: 'alert'
                })
            );
            setIsEdit(false);
            setProductDetail({ ...productDetail, is_published: true, published_at: publishedAt });
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Publish failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const handleUnpublish = async () => {
        try {
            await axios.put(`/products/${productId}/`, { is_published: false, published_at: null });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'UnPublished successfully!',
                    variant: 'alert'
                })
            );
            setIsEdit(false);
            setProductDetail({ ...productDetail, is_published: false, published_at: null });
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'UnPublish failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const cancelEditTimeStamp = () => {
        setIsEdit(false);
    };

    const handleLaunchClick = (idStr) => {
        const url = document.getElementById(idStr).value;
        window.open(url, '_blank');
        console.log(formik.values.productType);
    };

    const getProductTypeName = (productType) => {
        const selectedProductTypes = productTypes.filter((element) => element.value === productType);
        const productTypeName = selectedProductTypes[0] ? selectedProductTypes[0].label : '';
        return productTypeName;
    };

    const addChildProduct = async () => {
        try {
            const resData = await axios.post(`/products/${productId}/childs`, {
                child_product_id: childProductID
            });
            const newChildProductData = [
                ...childProductData,
                { id: resData.data.id, product_id: resData.data.child_product.id, product_name: resData.data.child_product.name }
            ];
            setChildProductData(newChildProductData);
            openSnackbar({
                open: true,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                message: 'Update is success!',
                variant: 'alert'
            });
        } catch (err) {
            console.info(err);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Add data is failed!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const deleteProductData = async (id) => {
        try {
            await axios.delete(`/products/childs/${id}`);
            const newChildProductData = childProductData.filter((row) => row.id !== id);
            setChildProductData(newChildProductData);
            openSnackbar({
                open: true,
                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                message: 'Delete is success!',
                variant: 'alert'
            });
        } catch (err) {
            console.info(err);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Delete data is failed!',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
    };

    const handleChangeChildProductID = (newChildProductID) => {
        setChildProductID(newChildProductID);
    };

    return (
        <MainCard title={!productId ? 'New Product' : `Product ID: ${productId}`} content>
            {myInfo &&
            myInfo.role &&
            (myInfo.role.name === 'super_user' || myInfo.role.name === 'video_upload' || myInfo.role.name === 'product_clean') ? (
                <>
                    <CardContent>
                        <Grid container spacing={gridSpacing}>
                            {myInfo &&
                            myInfo.role &&
                            (myInfo.role.name === 'super_user' ||
                                (myInfo.role.name === 'product_clean' && !productDetail?.is_published)) ? (
                                <Grid
                                    item
                                    sx={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        gap: 1,
                                        width: '100%'
                                    }}
                                >
                                    <Grid
                                        item
                                        xs={6}
                                        md={6}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
                                    >
                                        <FormLabel>Active: </FormLabel>
                                        <FormControlLabel
                                            value="end"
                                            control={
                                                <Switch
                                                    onChange={() => handleProductActive(!productActive)}
                                                    value={productActive}
                                                    color="primary"
                                                />
                                            }
                                            checked={productActive}
                                            label={productActive ? 'On' : 'Off'}
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        md={6}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
                                    >
                                        <FormLabel>Need Video: </FormLabel>
                                        <FormControlLabel
                                            value="end"
                                            control={
                                                <Switch
                                                    onChange={() => handleProductNeedVideo(!productVideoNeed)}
                                                    value={productVideoNeed}
                                                    color="primary"
                                                />
                                            }
                                            checked={productVideoNeed}
                                            label={productVideoNeed ? 'On' : 'Off'}
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        md={6}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
                                    >
                                        <FormLabel>Not For Sale: </FormLabel>
                                        <FormControlLabel
                                            value="end"
                                            control={
                                                <Switch
                                                    onChange={() => handleProductNotForSale(!productNotForSale)}
                                                    value={productNotForSale}
                                                    color="primary"
                                                />
                                            }
                                            checked={productNotForSale}
                                            label={productNotForSale ? 'On' : 'Off'}
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                    <Grid
                                        item
                                        xs={6}
                                        md={6}
                                        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}
                                    >
                                        <FormLabel>SoldOut: </FormLabel>
                                        <FormControlLabel
                                            value="end"
                                            control={
                                                <Switch
                                                    onChange={() => handleProductSoldOut(!productSoldOut)}
                                                    value={productSoldOut}
                                                    color="primary"
                                                />
                                            }
                                            checked={productSoldOut}
                                            label={productSoldOut ? 'On' : 'Off'}
                                            labelPlacement="end"
                                        />
                                    </Grid>
                                </Grid>
                            ) : (
                                <></>
                            )}

                            {productId && myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                                <>
                                    <Grid item xs={12} md={12}>
                                        <Stack>
                                            <InputLabel>Product Publish TimeStamp</InputLabel>

                                            <Grid container spacing={gridSpacing}>
                                                <Grid item xs={12} md={9}>
                                                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                                                        <DateTimePicker
                                                            slotProps={{ textField: { variant: 'outlined', fullWidth: true } }}
                                                            views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                                                            disabled={!isEdit}
                                                            value={publishedAt}
                                                            onChange={(newValue) => {
                                                                setPublishedAt(newValue);
                                                            }}
                                                            minutesStep={1}
                                                        />
                                                    </LocalizationProvider>
                                                </Grid>
                                                <Grid item xs={12} md={3} sx={{ alignSelf: 'center' }}>
                                                    <Stack
                                                        sx={{
                                                            display: 'flex',
                                                            flexDirection: 'row',
                                                            gap: 2,
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center'
                                                        }}
                                                    >
                                                        {
                                                            // eslint-disable-next-line no-nested-ternary
                                                            productDetail?.is_published ? (
                                                                isEdit ? (
                                                                    <>
                                                                        <Button
                                                                            fullWidth
                                                                            variant="contained"
                                                                            size="large"
                                                                            onClick={handlePublish}
                                                                        >
                                                                            Republish
                                                                        </Button>
                                                                        <Button
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            size="large"
                                                                            onClick={cancelEditTimeStamp}
                                                                        >
                                                                            Cancel
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            fullWidth
                                                                            variant="outlined"
                                                                            size="large"
                                                                            onClick={onEditTimeStamp}
                                                                        >
                                                                            Edit
                                                                        </Button>
                                                                        <Button
                                                                            fullWidth
                                                                            color="error"
                                                                            variant="contained"
                                                                            size="large"
                                                                            onClick={handleUnpublish}
                                                                        >
                                                                            Unpublish
                                                                        </Button>
                                                                    </>
                                                                )
                                                            ) : isEdit ? (
                                                                <>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="contained"
                                                                        size="large"
                                                                        onClick={handlePublish}
                                                                    >
                                                                        Publish
                                                                    </Button>
                                                                    <Button
                                                                        fullWidth
                                                                        variant="outlined"
                                                                        size="large"
                                                                        onClick={cancelEditTimeStamp}
                                                                    >
                                                                        Cancel
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button fullWidth variant="outlined" size="large" onClick={onEditTimeStamp}>
                                                                    Set Publish Time
                                                                </Button>
                                                            )
                                                        }
                                                    </Stack>
                                                </Grid>
                                            </Grid>
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Divider />
                                    </Grid>
                                </>
                            ) : null}

                            {myInfo &&
                            myInfo.role &&
                            (myInfo.role.name === 'super_user' ||
                                (myInfo.role.name === 'product_clean' && !productDetail?.is_published)) ? (
                                <Grid item xs={12}>
                                    <form onSubmit={formik.handleSubmit}>
                                        <Grid container spacing={gridSpacing}>
                                            <Grid item xs={3}>
                                                <Stack>
                                                    <InputLabel required>Product Name</InputLabel>
                                                    <TextField
                                                        id="productName"
                                                        name="productName"
                                                        value={formik.values.productName || ''}
                                                        onBlur={formik.handleBlur}
                                                        error={formik.touched.productName && Boolean(formik.errors.productName)}
                                                        helperText={formik.touched.productName && formik.errors.productName}
                                                        onChange={formik.handleChange}
                                                        fullWidth
                                                        placeholder="Enter product name"
                                                    />
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Stack>
                                                    <InputLabel>Source URL</InputLabel>
                                                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center' }}>
                                                        <TextField
                                                            id="sourceUrl"
                                                            name="sourceUrl"
                                                            value={formik.values.sourceUrl || ''}
                                                            onChange={formik.handleChange}
                                                            fullWidth
                                                            placeholder="Enter source url"
                                                        />
                                                        <LaunchIcon
                                                            fontSize="small"
                                                            onClick={() => handleLaunchClick('sourceUrl')}
                                                            sx={{ cursor: 'pointer' }}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={3}>
                                                <Stack>
                                                    <InputLabel>Video Source URL</InputLabel>
                                                    <Stack sx={{ display: 'flex', flexDirection: 'row', alignContent: 'center' }}>
                                                        <TextField
                                                            id="videoSourceUrl"
                                                            name="videoSourceUrl"
                                                            value={formik.values.videoSourceUrl || ''}
                                                            onChange={formik.handleChange}
                                                            fullWidth
                                                            placeholder="Enter video source url"
                                                        />
                                                        <LaunchIcon
                                                            fontSize="small"
                                                            onClick={() => handleLaunchClick('videoSourceUrl')}
                                                            sx={{ cursor: 'pointer' }}
                                                        />
                                                    </Stack>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Stack>
                                                    <InputLabel>Category</InputLabel>
                                                    <Select
                                                        fullWidth
                                                        id="productType"
                                                        name="productType"
                                                        placeholder="Category"
                                                        value={formik.values.productType || ''}
                                                        onChange={formik.handleChange}
                                                    >
                                                        {productTypes.map((category, index) => (
                                                            <MenuItem key={index} value={category.value}>
                                                                {category.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Stack>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Stack>
                                                    <InputLabel>Subcategory</InputLabel>
                                                    <Select
                                                        fullWidth
                                                        id="productSubType"
                                                        name="productSubType"
                                                        placeholder="SubCategory"
                                                        value={formik.values.productSubType || ''}
                                                        onChange={formik.handleChange}
                                                        disabled={getProductTypeName(formik.values.productType) !== 'System'}
                                                    >
                                                        {productSubTypes.map((subcategory, index) => (
                                                            <MenuItem key={index} value={subcategory.value}>
                                                                {subcategory.label}
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </Stack>
                                            </Grid>
                                        </Grid>
                                        <Grid item sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }} xs={12}>
                                            <Button variant="contained" type="submit">
                                                {productDetail ? 'Save' : 'Add Product'}
                                            </Button>
                                        </Grid>
                                    </form>
                                </Grid>
                            ) : (
                                <></>
                            )}

                            {myInfo &&
                                myInfo.role &&
                                myInfo.role.name === 'super_user' &&
                                productId &&
                                productDetail &&
                                productDetail.category &&
                                productDetail.category.name === 'System' &&
                                productDetail.subcategory &&
                                productDetail.subcategory.name === 'List' && (
                                    <>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="h3" component="div" sx={{ fontSize: '1rem', marginTop: '10px' }}>
                                                Child Products
                                            </Typography>
                                        </Grid>

                                        <Grid item xs={12} md={12}>
                                            <Stack
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    gap: 2,
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <TextField
                                                    value={childProductID}
                                                    onChange={(e) => handleChangeChildProductID(e.target.value)}
                                                    placeholder="Enter product ID"
                                                />
                                                <Button size="large" variant="contained" onClick={addChildProduct}>
                                                    Add Child Product
                                                </Button>
                                            </Stack>
                                        </Grid>

                                        <ChildProductListView childProductData={childProductData} deleteProductData={deleteProductData} />

                                        <Grid item sx={{ marginBottom: '30px' }} />
                                    </>
                                )}

                            {myInfo &&
                                myInfo.role &&
                                (myInfo.role.name === 'super_user' || myInfo.role.name === 'product_clean') &&
                                productId && (
                                    <>
                                        <Grid item xs={12}>
                                            <Divider />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="h3" component="div" sx={{ fontSize: '1rem', marginTop: '30px' }}>
                                                Product Variations
                                            </Typography>
                                            <Grid item xs={12}>
                                                <Grid
                                                    item
                                                    xs={12}
                                                    sm={12}
                                                    sx={{ textAlign: 'right', paddingRight: '20px', marginTop: '20px' }}
                                                >
                                                    <Tooltip title="Add Variation">
                                                        <Fab
                                                            color="primary"
                                                            size="small"
                                                            onClick={handleAddNewVariation}
                                                            sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                                                        >
                                                            <AddIcon fontSize="small" />
                                                        </Fab>
                                                    </Tooltip>
                                                </Grid>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TableContainer>
                                                    <Table>
                                                        <EnhancedTableHead
                                                            theme={theme}
                                                            order={order}
                                                            orderBy={orderBy}
                                                            onRequestSort={handleRequestSort}
                                                        />
                                                        <TableBody>
                                                            {productId && rows.length > 0 ? (
                                                                stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                                                                    /** Make sure no display bugs if row isn't an OrderData object */
                                                                    if (typeof row === 'number') return null;

                                                                    return (
                                                                        <TableRow
                                                                            hover
                                                                            role="checkbox"
                                                                            tabIndex={-1}
                                                                            key={index}
                                                                            onClick={() => setVariationID(row.id)}
                                                                        >
                                                                            <TableCell sx={{ pl: 3 }}>{row.id}</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                                {row.quantity}
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>{row.price}</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>USD</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>{row.index}</TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                                {row.shipping_cost}
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                                {row.total_cost}
                                                                            </TableCell>
                                                                            <TableCell sx={{ textAlign: 'center' }}>
                                                                                <Tooltip placement="top" title="Delete">
                                                                                    <IconButton
                                                                                        color="error"
                                                                                        size="large"
                                                                                        onClick={() => handleDeleteVariation(row)}
                                                                                    >
                                                                                        <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                                                    </IconButton>
                                                                                </Tooltip>
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })
                                                            ) : (
                                                                <TableRow hover role="checkbox" tabIndex={-1}>
                                                                    <TableCell sx={{ pl: 3, textAlign: 'center' }} colSpan={12}>
                                                                        No Data
                                                                    </TableCell>
                                                                </TableRow>
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </Grid>
                                        </Grid>{' '}
                                    </>
                                )}

                            {productId ? (
                                <Grid item xs={12}>
                                    <Typography variant="h3" component="div" sx={{ fontSize: '1rem', marginY: '30px' }}>
                                        {variationID ? `Product Variations ID: ${variationID}` : 'New Product Variation'}
                                    </Typography>
                                    <VariationDetails proID={parseInt(productId, 10)} varID={variationID} updateProductList={fetchData} />
                                </Grid>
                            ) : (
                                <></>
                            )}
                        </Grid>
                    </CardContent>
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

export default ProductDetail;

function ChildProductListView({ childProductData, deleteProductData }) {
    const [productDataList, setProductDataList] = React.useState([]);

    useEffect(() => {
        setProductDataList(JSON.parse(JSON.stringify(childProductData)));
    }, [childProductData]);

    return (
        <Grid item xs={12} sx={{ paddingTop: '10px !important' }}>
            <TableContainer sx={{ borderRadius: '8px' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{ pl: 3 }}>
                                Product ID
                            </TableCell>
                            <TableCell align="left">Product Name</TableCell>
                            <TableCell align="right" sx={{ pr: 3 }}>
                                Action
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {productDataList.length === 0 && (
                            <TableRow key="0">
                                <TableCell align="center" colSpan={3}>
                                    No Data
                                </TableCell>
                            </TableRow>
                        )}
                        {productDataList.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell align="left">
                                    <Typography>{row.product_id}</Typography>
                                </TableCell>
                                <TableCell align="left">
                                    <Typography>{row.product_name}</Typography>
                                </TableCell>
                                <TableCell sx={{ pr: 1 }} align="right">
                                    <Tooltip placement="top" title="Delete">
                                        <IconButton
                                            color="error"
                                            size="large"
                                            onClick={() => deleteProductData(row.id)}
                                            aria-label="Delete"
                                        >
                                            <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Grid>
    );
}

ChildProductListView.propTypes = {
    childProductData: PropTypes.any,
    deleteProductData: PropTypes.func
};
