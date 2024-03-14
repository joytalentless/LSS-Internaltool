import React from 'react';
import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, FormControl, FormHelperText, Divider, Grid, Modal, Typography, OutlinedInput, InputAdornment } from '@mui/material';
import PriceChangeIcon from '@mui/icons-material/PriceChange';

// project import
import { gridSpacing } from 'store/constant';
import useScriptRef from 'hooks/useScriptRef';
import MainCard from 'ui-component/cards/MainCard';

// third-party
import * as yup from 'yup';
import { Formik } from 'formik';

// yup validation-schema
const validationSchema = yup.object({
    price: yup.number().required('Enter the price').moreThan(0, 'Price is greater than zero')
});

function SetPriceModal({ openModal, handleClose, handleUpdatePrices, openSuccess }) {
    const theme = useTheme();
    const scriptedRef = useScriptRef();

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
                                Set Price
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <Formik
                                initialValues={{
                                    price: 0
                                }}
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                                    try {
                                        await handleUpdatePrices({ price: values.price });
                                        if (scriptedRef.current) {
                                            setStatus({ success: true });
                                            setSubmitting(false);
                                        }
                                        handleClose();
                                        openSuccess();
                                    } catch (err) {
                                        console.error(err);
                                        if (scriptedRef.current) {
                                            setStatus({ success: false });
                                            setErrors({ submit: err.message });
                                            setSubmitting(false);
                                        }
                                    }
                                }}
                            >
                                {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
                                    <form noValidate onSubmit={handleSubmit}>
                                        <Grid container spacing={gridSpacing}>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth error={Boolean(touched.price && errors.price)}>
                                                    <OutlinedInput
                                                        id="price"
                                                        name="price"
                                                        type="number"
                                                        value={values.price}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        placeholder="Enter price"
                                                        autoComplete="false"
                                                        startAdornment={
                                                            <InputAdornment position="start">
                                                                <PriceChangeIcon />
                                                            </InputAdornment>
                                                        }
                                                    />
                                                    {touched.price && errors.price && (
                                                        <FormHelperText error id="helper-text-price">
                                                            {errors.price}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
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

SetPriceModal.propTypes = {
    openModal: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    openSuccess: PropTypes.func.isRequired,
    handleUpdatePrices: PropTypes.func.isRequired
};

export default SetPriceModal;
