import PropTypes from 'prop-types';
import React, { useEffect } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, FormControl, Divider, Grid, Modal, Typography, MenuItem, OutlinedInput, Select } from '@mui/material';

// project imports
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import useScriptRef from 'hooks/useScriptRef';

// third-party
import * as yup from 'yup';
import { Formik } from 'formik';

// yup validation-schema
const validationSchema = yup.object({
    admin_note: yup.string().max(500, 'Max length should be 500'),
    variantID: yup.number().moreThan(-1, 'Choose Variant ID')
});

// ==============================|| MODAL ||============================== //

function InquireResolveModal({ openModal, modalOption, handleClose, openSuccess, openFail, inquireID, variants }) {
    const theme = useTheme();
    const scriptedRef = useScriptRef();
    const [variantTypes, setVariantTypes] = React.useState([{}]);

    useEffect(() => {
        if (modalOption === 'resolve') {
            let newVariants = [];
            if (variants)
                newVariants = variants.map((variant) => {
                    variant.value = variant.id;
                    variant.label = variant.id;
                    return variant;
                });
            newVariants.unshift({ value: 0, label: 'Choose variant ID' });
            setVariantTypes(newVariants);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Modal open={openModal} onClose={handleClose} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
            <div tabIndex={-1}>
                <MainCard
                    sx={{
                        position: 'absolute',
                        width: { xs: 280, lg: 450 },
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                    }}
                >
                    <Grid container spacing={gridSpacing}>
                        <Grid item xs={12}>
                            <Typography variant="h1" component="div" sx={{ fontSize: '1rem' }}>
                                {modalOption === 'resolve' && 'Add Notes'}
                                {modalOption === 'product_add' && 'Add Product ID'}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <Formik
                                initialValues={{
                                    admin_note: '',
                                    variantID: 0,
                                    productID: 0
                                }}
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                                    try {
                                        if (modalOption === 'resolve') {
                                            if (values.admin_note === '') {
                                                openFail('Add admin notes');
                                                return;
                                            }
                                            if (values.variantID === 0) {
                                                openFail('Choose Variant ID');
                                                return;
                                            }
                                            await axios.put(`/inquires/${inquireID}/`, {
                                                is_resolved: true,
                                                admin_note: values.admin_note,
                                                variant_id: values.variantID
                                            });
                                        } else if (modalOption === 'product_add') {
                                            if (values.productID === '') {
                                                openFail('Add Product ID');
                                                return;
                                            }
                                            await axios.put(`/inquires/${inquireID}/`, {
                                                product_id: values.productID
                                            });
                                        }
                                        if (scriptedRef.current) {
                                            setStatus({ success: true });
                                            setSubmitting(false);
                                        }
                                        handleClose();
                                        openSuccess(values.admin_note, values.variantID, values.productID);
                                    } catch (err) {
                                        console.error(err);
                                        if (scriptedRef.current) {
                                            setStatus({ success: false });
                                            setErrors({ submit: err.message });
                                            setSubmitting(false);
                                        }
                                        openFail();
                                    }
                                }}
                            >
                                {({ handleBlur, handleChange, handleSubmit, isSubmitting, values }) => (
                                    <form noValidate onSubmit={handleSubmit}>
                                        <Grid container spacing={gridSpacing}>
                                            <Grid item xs={12}>
                                                {modalOption === 'product_add' && (
                                                    <FormControl fullWidth>
                                                        <OutlinedInput
                                                            id="productID"
                                                            name="productID"
                                                            type="text"
                                                            value={values.productID}
                                                            onBlur={handleBlur}
                                                            onChange={handleChange}
                                                            fullWidth
                                                            placeholder="Add Product ID"
                                                            autoComplete="false"
                                                        />
                                                    </FormControl>
                                                )}
                                                {modalOption === 'resolve' && (
                                                    <>
                                                        <FormControl fullWidth>
                                                            <OutlinedInput
                                                                id="admin_note"
                                                                name="admin_note"
                                                                type="text"
                                                                value={values.admin_note}
                                                                onBlur={handleBlur}
                                                                onChange={handleChange}
                                                                fullWidth
                                                                placeholder="Enter your note"
                                                                autoComplete="false"
                                                            />
                                                        </FormControl>
                                                        <FormControl fullWidth>
                                                            <Select
                                                                size="small"
                                                                fullWidth
                                                                id="variantID"
                                                                name="variantID"
                                                                placeholder="Variant ID"
                                                                value={values.variantID}
                                                                onChange={handleChange}
                                                                sx={{ marginTop: '15px', height: '50px' }}
                                                            >
                                                                {variantTypes.map((variant, index) => (
                                                                    <MenuItem key={index} value={variant.value}>
                                                                        {variant.label}
                                                                    </MenuItem>
                                                                ))}
                                                            </Select>
                                                        </FormControl>
                                                    </>
                                                )}
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Divider />
                                            </Grid>
                                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'end', gap: 2 }}>
                                                <Button type="button" onClick={handleClose}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    type="submit"
                                                    sx={{
                                                        color: 'theme.palette.grey[900]',
                                                        background: 'black',
                                                        '&: hover': { background: theme.palette.grey[900] }
                                                    }}
                                                    disabled={isSubmitting}
                                                >
                                                    OK
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </form>
                                )}
                            </Formik>
                        </Grid>
                    </Grid>
                </MainCard>
            </div>
        </Modal>
        // </Grid>
    );
}

InquireResolveModal.propTypes = {
    openModal: PropTypes.bool.isRequired,
    modalOption: PropTypes.string.isRequired,
    handleClose: PropTypes.func.isRequired,
    openSuccess: PropTypes.func.isRequired,
    openFail: PropTypes.func.isRequired,
    inquireID: PropTypes.number.isRequired,
    variants: PropTypes.array
};

export default InquireResolveModal;
