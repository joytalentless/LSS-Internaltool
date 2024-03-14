import PropTypes from 'prop-types';
import React, { useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    Divider,
    Grid,
    Modal,
    Typography,
    OutlinedInput,
    InputAdornment
} from '@mui/material';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

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
    password: yup.string().required('Enter your password').min(6, 'Password should be of minimum 6 characters length'),
    confirm: yup
        .string()
        .required('Confirm your password')
        .oneOf([yup.ref('password')], 'Passwords must match')
});

// ==============================|| MODAL ||============================== //

function ChangePwdModal({ openModal, handleClose, user, openSuccess }) {
    const theme = useTheme();
    const scriptedRef = useScriptRef();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
                                Change Password
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <Formik
                                initialValues={{
                                    password: '',
                                    confirm: ''
                                }}
                                validationSchema={validationSchema}
                                onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
                                    try {
                                        await axios.put(`/users/${user.id}/change-password/`, { new_password: values.password });
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
                                                <FormControl fullWidth error={Boolean(touched.password && errors.password)}>
                                                    <OutlinedInput
                                                        id="password"
                                                        name="password"
                                                        type={showPassword ? 'text' : 'password'}
                                                        value={values.password}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        placeholder="Enter password"
                                                        autoComplete="false"
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => {
                                                                        setShowPassword(!showPassword);
                                                                    }}
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                    }}
                                                                    edge="end"
                                                                    size="large"
                                                                >
                                                                    {showPassword ? <Visibility /> : <VisibilityOff />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                    {touched.password && errors.password && (
                                                        <FormHelperText error id="helper-text-password">
                                                            {errors.password}
                                                        </FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth error={Boolean(touched.confirm && errors.confirm)}>
                                                    <OutlinedInput
                                                        id="confirm"
                                                        name="confirm"
                                                        type={showConfirm ? 'text' : 'password'}
                                                        value={values.confirm}
                                                        onBlur={handleBlur}
                                                        onChange={handleChange}
                                                        fullWidth
                                                        placeholder="Confirm password"
                                                        autoComplete="false"
                                                        endAdornment={
                                                            <InputAdornment position="end">
                                                                <IconButton
                                                                    aria-label="toggle password visibility"
                                                                    onClick={() => {
                                                                        setShowConfirm(!showConfirm);
                                                                    }}
                                                                    onMouseDown={(e) => {
                                                                        e.preventDefault();
                                                                    }}
                                                                    edge="end"
                                                                    size="large"
                                                                >
                                                                    {showConfirm ? <Visibility /> : <VisibilityOff />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        }
                                                    />
                                                    {touched.confirm && errors.confirm && (
                                                        <FormHelperText error id="helper-text-confirm">
                                                            {errors.confirm}
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

ChangePwdModal.propTypes = {
    openModal: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    openSuccess: PropTypes.func.isRequired,
    user: PropTypes.any.isRequired
};

export default ChangePwdModal;
