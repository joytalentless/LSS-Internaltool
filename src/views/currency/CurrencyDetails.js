import PropTypes from 'prop-types';
import React, { useState, useEffect, useCallback } from 'react';
// material-ui
import {
    Button,
    CardContent,
    Checkbox,
    Grid,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Toolbar,
    FormControlLabel,
    Typography,
    Stack
} from '@mui/material';
import { useLocation } from 'react-router-dom';
// project imports
import MainCard from 'ui-component/cards/MainCard';
// redux
import { useDispatch } from '../../store';
import { openSnackbar } from '../../store/slices/snackbar';
import axios from 'utils/axios';
import useAuth from 'hooks/useAuth';
// ==============================|| TABLE - HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, numSelected, rowCount }) {
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
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Product ID
                </TableCell>
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Name
                </TableCell>
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Media
                </TableCell>
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Price
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired
};

// ==============================|| TABLE - ENHANCED ||============================== //

export default function CurrencyDetails() {
    const { user: myInfo } = useAuth();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const currency = searchParams.get('currency');
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [dense] = useState(false);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [products, setProducts] = useState([]);
    const [selectedSuperAll, setSelectedSuperAll] = useState(false);
    const [totalCount, setTotalCount] = useState(0);

    const fetchProducts = useCallback(async () => {
        setIsLoading(true);
        await axios
            .get('/products', {
                params: {
                    order_by: 'created_at',
                    desc: true,
                    page,
                    page_size: rowsPerPage,
                    currency: currency === 'A/N' ? 'null' : currency
                }
            })
            .then((res) => {
                setTotalCount(res.data.count);
                setProducts(res.data.results);
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, rowsPerPage, currency]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const handleSuperAllSelected = useCallback(() => {
        if (selectedSuperAll) {
            const newSelectedId = products.map((n) => n.id);
            setSelected(newSelectedId);
        } else {
            setSelected([]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedSuperAll]);

    useEffect(() => {
        handleSuperAllSelected();
    }, [handleSuperAllSelected]);

    const handleSelectAllClick = (event) => {
        setSelectedSuperAll(false);
        if (event.target.checked) {
            if (selected.length > 0) {
                setSelected([]);
            } else {
                const newSelectedId = products.map((n) => n.id);
                setSelected(newSelectedId);
            }
            return;
        }
        setSelected([]);
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
        setSelected(newSelected);
        setSelectedSuperAll(false);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event?.target.value, 10));
        setPage(0);
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - products.length) : 0;

    const handleConvertCurrency = async () => {
        // eslint-disable-next-line object-shorthand
        await axios
            .post('/products/update-currency/', { currency: currency === 'A/N' ? null : currency, product_ids: selected })
            .then(() => {
                fetchProducts();
                dispatch(
                    openSnackbar({
                        open: true,
                        anchorOrigin: { vertical: 'top', horizontal: 'right' },
                        message: 'All currencies have been updated successfully!',
                        variant: 'alert',
                        alert: {
                            color: 'success'
                        }
                    })
                );
                // refetching data parts
            });
    };

    return (
        <MainCard content={false} title="Products List">
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ padding: '12px' }}>
                        <Toolbar
                            sx={{
                                p: 0,
                                pl: 1,
                                pr: 1,
                                ...(selected.length > 0 && {
                                    color: (theme) => theme.palette.secondary.main
                                })
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
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
                                {selected.length || selectedSuperAll ? (
                                    <Typography color="inherit" variant="subtitle1">
                                        {selectedSuperAll ? totalCount : selected.length} selected
                                    </Typography>
                                ) : (
                                    <Typography variant="h4" id="tableTitle">
                                        No products selected
                                    </Typography>
                                )}
                            </Stack>
                        </Toolbar>

                        <Button
                            variant="contained"
                            size="large"
                            disabled={!selected.length || currency === 'USD'}
                            onClick={() => {
                                handleConvertCurrency();
                            }}
                        >
                            Convert Currency
                        </Button>
                    </Stack>

                    <TableContainer>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size={dense ? 'small' : 'medium'}>
                                <EnhancedTableHead
                                    numSelected={selected.length}
                                    onSelectAllClick={handleSelectAllClick}
                                    rowCount={products.length}
                                />
                                <TableBody>
                                    {products.map((row, index) => {
                                        if (typeof row === 'number') return null;
                                        const isItemSelected = isSelected(row.id);
                                        const labelId = `enhanced-table-checkbox-${index}`;
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
                                        const price = variant && variant.inventory && variant.inventory.price;

                                        return (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={row.id}
                                                selected={isItemSelected}
                                            >
                                                <TableCell sx={{ pl: 3 }} padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        onClick={(event) => handleClick(event, row.id)}
                                                        checked={isItemSelected}
                                                        inputProps={{
                                                            'aria-labelledby': labelId
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell sx={{ pl: 3, textAlign: 'center' }}>{row.id}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>{row.name}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    {url ? <img src={url} height={50} alt={row.name} /> : <>No media</>}
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>{price}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {emptyRows > 0 && (
                                        <TableRow
                                            style={{
                                                height: (dense ? 33 : 53) * emptyRows
                                            }}
                                        >
                                            <TableCell colSpan={6} />
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </TableContainer>

                    {/* table pagination */}
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 100]}
                        component="div"
                        count={totalCount}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
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
}
