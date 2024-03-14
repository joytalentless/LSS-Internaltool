import PropTypes from 'prop-types';
import React, { useEffect, useState, useCallback } from 'react';

// material-ui
import {
    Button,
    Divider,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    TextField,
    IconButton,
    Tooltip
} from '@mui/material';
import '@mui/lab';
import { DeleteForever } from '@mui/icons-material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

// project imports
import { gridSpacing } from 'store/constant';
import InputLabel from 'ui-component/extended/Form/InputLabel';
import ImageUploader from 'ui-component/ImageUploader';

// third-party
import * as yup from 'yup';
import { useFormik } from 'formik';
import axios from 'utils/axios';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';
import CircularProgress from '@mui/material/CircularProgress';
import useAuth from 'hooks/useAuth';

// yup validation-schema
const validationSchema = yup.object({
    inventoryCount: yup.number().min(1).required('InventoryCount is required and type must be number'),
    index: yup.number().min(1).required('Index is required and type must be number')
});

// ==============================|| METADATA LIST ||============================== //

function MetaDataListView({ metaData, saveMetaData, varID }) {
    const dispatch = useDispatch();
    const [editing, setEditing] = useState({});
    const [metaDataList, setMetaDataList] = useState([]);
    const [editingCellIndex, setEditingCellIndex] = useState(false);

    useEffect(() => {
        setMetaDataList(JSON.parse(JSON.stringify(metaData)));
    }, [metaData]);

    const handleEditClick = (index) => {
        if (editingCellIndex === false) {
            setEditing((prevState) => ({
                ...prevState,
                [index]: true
            }));
            setEditingCellIndex(true);
        }
    };

    const handleCancelClick = (index) => {
        setEditing((prevState) => ({
            ...prevState,
            [index]: false
        }));
        metaDataList[index].field = metaData[index].field;
        metaDataList[index].value = metaData[index].value;
        metaDataList[index].index = metaData[index].index;
        setMetaDataList([...metaDataList]);
        setEditingCellIndex(false);
    };

    const handleConfirmClick = async (index) => {
        try {
            await axios.put(`/variants/${varID}/metadata`, { metadata: metaDataList });
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Metadata updated successfully!',
                    variant: 'alert'
                })
            );
            saveMetaData(index, metaDataList[index]);
        } catch (error) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Metadata update failed',
                    variant: 'alert',
                    alert: {
                        color: 'error'
                    }
                })
            );
        }
        setEditing((prevState) => ({
            ...prevState,
            [index]: false
        }));
        setEditingCellIndex(false);
    };

    const deleteMetaData = (index) => {
        metaDataList[index].is_deleted = true;
        saveMetaData(index, metaDataList[index]);
    };

    const handleKeyChange = (e, index) => {
        metaDataList[index].field = e.target.value;
    };

    const handleValueChange = (e, index) => {
        metaDataList[index].value = e.target.value;
    };

    const handleIndexChange = (e, index) => {
        metaDataList[index].index = e.target.value;
    };

    return (
        <>
            {metaDataList.length > 0 && (
                <Grid item xs={12} sx={{ paddingTop: '10px !important' }}>
                    <TableContainer sx={{ borderRadius: '8px', border: '1px solid rgb(238, 238, 238)' }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="left" sx={{ pl: 3 }}>
                                        Property
                                    </TableCell>
                                    <TableCell align="left" style={{ width: '90%' }}>
                                        Value
                                    </TableCell>
                                    <TableCell align="left" style={{ width: '10%' }}>
                                        Index
                                    </TableCell>
                                    <TableCell align="right" sx={{ pr: 3 }} />
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {metaDataList.map(
                                    (data, index) =>
                                        !data.is_deleted && (
                                            <TableRow key={index}>
                                                <TableCell align="left">
                                                    {editing[index] ? (
                                                        <TextField
                                                            size="small"
                                                            defaultValue={data.field || ''}
                                                            onChange={(e) => handleKeyChange(e, index)}
                                                        />
                                                    ) : (
                                                        <Typography>{data.field}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {editing[index] ? (
                                                        <TextField
                                                            size="small"
                                                            multiline
                                                            defaultValue={data.value || ''}
                                                            onChange={(e) => handleValueChange(e, index)}
                                                            fullWidth
                                                        />
                                                    ) : (
                                                        <Typography style={{ whiteSpace: 'pre-line' }}>{data.value}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell align="left">
                                                    {editing[index] ? (
                                                        <TextField
                                                            type="number"
                                                            size="small"
                                                            defaultValue={data.index || ''}
                                                            onChange={(e) => handleIndexChange(e, index)}
                                                        />
                                                    ) : (
                                                        <Typography>{data.index}</Typography>
                                                    )}
                                                </TableCell>
                                                <TableCell sx={{ pr: 1 }} align="right">
                                                    {!editing[index] && (
                                                        <>
                                                            <Tooltip placement="top" title="Edit">
                                                                <IconButton
                                                                    color="primary"
                                                                    size="small"
                                                                    onClick={() => handleEditClick(index)}
                                                                    aria-label="Edit"
                                                                >
                                                                    <EditIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip placement="top" title="Delete">
                                                                <IconButton
                                                                    color="error"
                                                                    size="large"
                                                                    onClick={() => deleteMetaData(index)}
                                                                    aria-label="Delete"
                                                                >
                                                                    <DeleteForever sx={{ fontSize: '1.1rem' }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </>
                                                    )}
                                                    {editing[index] && (
                                                        <>
                                                            <Tooltip placement="top" title="Save">
                                                                <IconButton
                                                                    color="success"
                                                                    size="small"
                                                                    onClick={() => handleConfirmClick(index)}
                                                                    aria-label="Confirm"
                                                                >
                                                                    <CheckIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip placement="top" title="Cancel">
                                                                <IconButton
                                                                    color="error"
                                                                    size="small"
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
                                        )
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Grid>
            )}
        </>
    );
}

MetaDataListView.propTypes = {
    metaData: PropTypes.any,
    saveMetaData: PropTypes.func,
    varID: PropTypes.number
};

// ==============================|| ADD ITEM PAGE ||============================== //

function AddItemPage({ handleAddItem, setAddItemClicked }) {
    const [itemProperty, setItemProperty] = useState('');
    const [itemValue, setItemValue] = useState('');
    const [itemIndex, setItemIndex] = useState(null);
    const [errors, setErrors] = useState({
        propertyError: '',
        valueError: '',
        index: null
    });

    const handleChange = (event) => {
        const value = event.target.value;
        const name = event.target.name;

        if (name === 'property') setItemProperty(value);
        else if (name === 'value') setItemValue(value);
        else setItemIndex(value);

        if (name === 'property' && value === '') {
            setErrors({
                ...errors,
                propertyError: 'Meta Field is required.'
            });
        } else if (name === 'value' && value === '') {
            setErrors({
                ...errors,
                valueError: 'Meta Value is required.'
            });
        } else if (name === 'index' && value === '') {
            setErrors({
                ...errors,
                indexError: 'Meta Index is required.'
            });
        } else {
            setErrors({
                ...errors,
                propertyError: '',
                valueError: '',
                indexError: ''
            });
        }
    };

    const handleOk = () => {
        const data = {
            field: itemProperty,
            value: itemValue,
            index: itemIndex
        };

        handleAddItem(data);
    };

    return (
        <>
            <Grid container spacing={gridSpacing}>
                <Grid item xs={12} md={2}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle1" id="itemValue1">
                            Meta Field
                        </Typography>
                        <TextField
                            fullWidth
                            name="property"
                            value={itemProperty || ''}
                            onChange={handleChange}
                            error={Boolean(errors.propertyError)}
                            helperText={errors.propertyError}
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} md={8}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle1" id="itemValue2">
                            Meta Value
                        </Typography>
                        <TextField
                            fullWidth
                            multiline
                            name="value"
                            value={itemValue || ''}
                            onChange={handleChange}
                            error={Boolean(errors.valueError)}
                            helperText={errors.valueError}
                        />
                    </Stack>
                </Grid>
                <Grid item xs={12} md={2}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle1" id="itemValue3">
                            Meta Index
                        </Typography>
                        <TextField
                            type="number"
                            fullWidth
                            name="index"
                            value={itemIndex || ''}
                            onChange={handleChange}
                            error={Boolean(errors.indexError)}
                            helperText={errors.indexError}
                        />
                    </Stack>
                </Grid>
                <Grid item container justifyContent="flex-end">
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Button color="error" onClick={() => setAddItemClicked(false)}>
                            Cancel
                        </Button>
                        <Button
                            disabled={
                                !itemProperty ||
                                !itemValue ||
                                !itemIndex ||
                                Boolean(errors.valueError) ||
                                Boolean(errors.propertyError) ||
                                Boolean(errors.indexError)
                            }
                            variant="contained"
                            size="small"
                            onClick={handleOk}
                        >
                            Add
                        </Button>
                    </Stack>
                </Grid>
            </Grid>
        </>
    );
}

AddItemPage.propTypes = {
    handleAddItem: PropTypes.func,
    setAddItemClicked: PropTypes.func
};

// ==============================|| VARIATION DETAILS ||============================== //

function VariationDetails({ proID, varID, updateProductList }) {
    // const navigate = useNavigate();
    const dispatch = useDispatch();
    const [metaData, setMetaData] = useState([]);
    const [isNewPage, SetIsNewPage] = useState(true);
    const [mediaData, setMediaData] = useState([]);
    const [addItemClicked, setAddItemClicked] = useState(false);
    const [productID, setProductID] = useState(proID);
    const [variationID, setVariationID] = useState(varID);
    const [uploading, setUploading] = useState(false);
    const { user: myInfo } = useAuth();

    const formik = useFormik({
        initialValues: {
            inventoryCount: '',
            currency: '',
            pricing: '',
            index: ''
        },
        validationSchema,
        onSubmit: async (values) => {
            if (values) {
                if (isNewPage && !productID) {
                    console.log('New variation');
                } else if (productID && !variationID) {
                    // Have to create variant
                    try {
                        const resData = await axios.post('/variants/', { product_id: productID, index: values.index });
                        await axios.post(`/variants/${resData.data.id}/inventory`, {
                            price: values.pricing ? parseInt(values.pricing, 10) : 0,
                            currency: values.currency,
                            quantity: values.inventoryCount
                        });
                        await axios.put(`/variants/${resData.data.id}/metadata`, { metadata: metaData });
                        dispatch(
                            openSnackbar({
                                open: true,
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                message: 'Creating variation is succeeded!',
                                variant: 'alert'
                            })
                        );
                        updateProductList(resData.data.id);
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
                } else {
                    // Update inventory
                    try {
                        await axios.put(`/variants/${variationID}/`, { product_id: productID, index: values.index });
                        await axios.put(`/variants/${variationID}/inventory`, {
                            price: values.pricing,
                            currency: values.currency,
                            quantity: values.inventoryCount
                        });
                        await axios.put(`/variants/${variationID}/metadata`, { metadata: metaData });
                        dispatch(
                            openSnackbar({
                                open: true,
                                anchorOrigin: { vertical: 'top', horizontal: 'right' },
                                message: 'Updating inventory is succeeded!',
                                variant: 'alert'
                            })
                        );
                        updateProductList(variationID);
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

    const fetchVariationData = useCallback(async () => {
        setProductID(proID);
        setVariationID(varID);
        if (proID && varID) {
            SetIsNewPage(false);
            try {
                const resData = await axios.get(`/variants/${varID}/`);
                formik.setValues({
                    inventoryCount: resData.data.inventory.quantity,
                    currency: resData.data.inventory.currency,
                    pricing: resData.data.inventory.price,
                    index: resData.data.index
                });
                const metaList = resData.data.metadata.filter((item) => item.is_active);
                const newMediaData = resData.data.media
                    .filter((item) => item.is_active === true)
                    .sort((a, b) => a.index - b.index)
                    .map((image) => ({
                        ...image,
                        index: image.id,
                        isNew: false,
                        url: process.env.REACT_APP_MEDIA_BASE_URL + process.env.REACT_APP_MEDIA_UPLOAD_LOCATION + image.url
                    }));
                setMetaData(metaList);
                setMediaData(newMediaData);
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
        } else if (!varID) {
            SetIsNewPage(true);
            setMetaData([]);
            formik.resetForm();
            setMediaData([]);
            setAddItemClicked(false);
        } else {
            SetIsNewPage(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [proID, varID]);

    useEffect(() => {
        fetchVariationData();
    }, [fetchVariationData]);

    const saveMetaData = async (index, updatedData) => {
        if (!metaData[index].id && updatedData.is_deleted) {
            const newMetaData = metaData.filter((_, i) => index !== i);
            setMetaData([...newMetaData]);
        } else {
            metaData[index].field = updatedData.field;
            metaData[index].value = updatedData.value;
            metaData[index].index = updatedData.index;
            metaData[index].is_deleted = updatedData.is_deleted;
            setMetaData([...metaData]);
        }
    };

    // add item handler
    const handleAddItem = async (addingData) => {
        setMetaData([...metaData, { ...addingData }]);
        setAddItemClicked(false);
    };

    const handleAddMedia = async (index, addingMedias) => {
        if (variationID) {
            setUploading(true);
            const promises = addingMedias.map(async (addingMedia) => {
                const formData = new FormData();
                formData.set('file', addingMedia.fileInfo);
                formData.set('index', index + 1);
                const resData = await axios.post(`/variants/${variationID}/media`, formData);
                return resData;
            });
            const resDatas = await Promise.all(promises);
            const newMediaData = [];
            for (let i = 0; i < resDatas.length; i += 1) {
                newMediaData.push({
                    ...resDatas[i].data,
                    index: resDatas[i].data.id,
                    isNew: false,
                    url: process.env.REACT_APP_MEDIA_BASE_URL + process.env.REACT_APP_MEDIA_UPLOAD_LOCATION + resDatas[i].data.url
                });
            }
            setMediaData([...mediaData, ...newMediaData]);
            setUploading(false);
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Please create variation first!',
                    variant: 'alert',
                    alert: {
                        color: 'warning'
                    }
                })
            );
        }
    };

    const handleDeleteMedia = async (id) => {
        if (variationID) {
            setUploading(true);
            await axios.delete(`/variants/${variationID}/media`, { data: { id } });
            setUploading(false);
            const newMediaData = mediaData.filter((item) => item.index !== id);
            setMediaData([...newMediaData]);
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Please create variation first!',
                    variant: 'alert',
                    alert: {
                        color: 'warning'
                    }
                })
            );
        }
    };

    const handleUpdateMedia = async (newImages) => {
        if (variationID) {
            setUploading(true);
            const promises = [];
            for (let i = 0; i < newImages.length; i += 1) {
                promises.push(axios.put(`/variants/${variationID}/media`, { id: newImages[i].index, index: newImages[i].id }));
            }
            await Promise.all(promises);
            setUploading(false);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Media index updated!',
                    variant: 'alert',
                    alert: {
                        color: 'info'
                    }
                })
            );
            setMediaData(newImages);
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Please create variation first!',
                    variant: 'alert',
                    alert: {
                        color: 'warning'
                    }
                })
            );
        }
    };

    return (
        <>
            <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={gridSpacing}>
                    {myInfo && myInfo.role && (myInfo.role.name === 'super_user' || myInfo.role.name === 'product_clean') ? (
                        <>
                            <Grid item xs={12} md={3}>
                                <Stack>
                                    <InputLabel required>Inventory Count</InputLabel>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        id="inventoryCount"
                                        name="inventoryCount"
                                        value={formik.values.inventoryCount || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.inventoryCount && Boolean(formik.errors.inventoryCount)}
                                        helperText={formik.touched.inventoryCount && formik.errors.inventoryCount}
                                        placeholder="5"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Stack>
                                    <InputLabel required>Index</InputLabel>
                                    <TextField
                                        fullWidth
                                        type="number"
                                        id="index"
                                        name="index"
                                        value={formik.values.index || ''}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        error={formik.touched.index && Boolean(formik.errors.index)}
                                        helperText={formik.touched.index && formik.errors.index}
                                        placeholder="5"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Stack>
                                    <InputLabel>Pricing</InputLabel>
                                    <TextField
                                        type="number"
                                        fullWidth
                                        id="pricing"
                                        name="pricing"
                                        value={formik.values.pricing || ''}
                                        onChange={formik.handleChange}
                                        placeholder="200"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <Stack>
                                    <InputLabel>Currency</InputLabel>
                                    <TextField
                                        fullWidth
                                        id="currency"
                                        name="currency"
                                        value={formik.values.currency || ''}
                                        onChange={formik.handleChange}
                                        placeholder="USD"
                                    />
                                </Stack>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                            <Grid item xs={12}>
                                <Typography variant="h3" component="div" sx={{ fontSize: '1rem', marginTop: '30px' }}>
                                    Product Variation Metadata
                                </Typography>
                            </Grid>

                            {metaData ? <MetaDataListView metaData={metaData} saveMetaData={saveMetaData} varID={varID} /> : ''}

                            {addItemClicked ? (
                                <Grid item xs={12}>
                                    <AddItemPage handleAddItem={handleAddItem} setAddItemClicked={setAddItemClicked} />
                                </Grid>
                            ) : (
                                <Grid item>
                                    <Button variant="text" onClick={() => setAddItemClicked(true)}>
                                        + Add Item
                                    </Button>
                                </Grid>
                            )}
                            <Grid item sx={{ display: 'flex', justifyContent: 'flex-end' }} xs={12}>
                                <Button variant="contained" type="submit">
                                    {isNewPage ? 'Add New Product Variation' : 'Save'}
                                </Button>
                            </Grid>
                            <Grid item xs={12}>
                                <Divider />
                            </Grid>
                        </>
                    ) : (
                        <></>
                    )}

                    {myInfo &&
                    myInfo.role &&
                    (myInfo.role.name === 'super_user' || myInfo.role.name === 'video_upload' || myInfo.role.name === 'product_clean') ? (
                        <Grid item xs={12}>
                            <Stack>
                                <Typography variant="h3" component="div" sx={{ fontSize: '1rem', marginTop: '30px' }}>
                                    Product Variation Media
                                </Typography>
                                <Grid
                                    item
                                    xs={12}
                                    sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
                                >
                                    {uploading && (
                                        <Stack
                                            justifyContent="center"
                                            alignItems="center"
                                            gap={1}
                                            sx={{ position: 'absolute', top: '25%', left: '44%', zIndex: 9999 }}
                                        >
                                            <CircularProgress size={60} />
                                            <Typography fontSize={20}>Please wait...</Typography>
                                        </Stack>
                                    )}
                                    <Stack
                                        sx={{
                                            pointerEvents: uploading ? 'none' : 'auto', // Disables click events when isNewPage is true
                                            opacity: uploading ? 0.3 : 1 // Adds blur effect when isNewPage is true
                                        }}
                                    >
                                        {isNewPage ? (
                                            <ImageUploader
                                                uploadable={false}
                                                addMedia={handleAddMedia}
                                                updateMedia={handleUpdateMedia}
                                                deleteMedia={handleDeleteMedia}
                                            />
                                        ) : (
                                            <ImageUploader
                                                uploadable
                                                addMedia={handleAddMedia}
                                                updateMedia={handleUpdateMedia}
                                                deleteMedia={handleDeleteMedia}
                                                existImages={mediaData}
                                            />
                                        )}
                                    </Stack>
                                </Grid>
                            </Stack>
                        </Grid>
                    ) : (
                        <></>
                    )}
                </Grid>
            </form>
        </>
    );
}

VariationDetails.propTypes = {
    proID: PropTypes.number,
    varID: PropTypes.number,
    updateProductList: PropTypes.func
};

export default VariationDetails;
