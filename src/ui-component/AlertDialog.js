import PropTypes from 'prop-types';
import React from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';

// ===============================|| UI DIALOG - SWEET ALERT ||=============================== //

export default function AlertDialog({ type, open, handleConfirmAction, handleClose }) {
    const theme = useTheme();

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                sx={{ p: 3 }}
            >
                {open && (
                    <>
                        <DialogTitle id="alert-dialog-title">{type === 'delete' && 'Delete'}</DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                <Typography variant="body2" component="span">
                                    {type === 'delete' && 'Are you sure to delete this item?'}
                                </Typography>
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions sx={{ pr: 2.5 }}>
                            <Button
                                sx={{ color: theme.palette.error.dark, borderColor: theme.palette.error.dark }}
                                onClick={handleClose}
                                color="secondary"
                            >
                                Disagree
                            </Button>
                            <Button variant="contained" size="small" onClick={handleConfirmAction} autoFocus>
                                Agree
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
}

AlertDialog.propTypes = {
    type: PropTypes.string,
    open: PropTypes.bool,
    handleConfirmAction: PropTypes.func,
    handleClose: PropTypes.func
};
