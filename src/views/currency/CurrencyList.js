import React, { useState, useEffect } from 'react';
// material-ui
import {
    CardContent,
    Grid,
    Link,
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
// ==============================|| TABLE - BASIC ||============================== //

export default function CurrencyList() {
    const { user: myInfo } = useAuth();
    const [tableData, setTableData] = useState([
        {
            code: 'USD',
            name: 'United States Dollar',
            symbol: '$',
            count: 0
        },
        {
            code: 'EUR',
            name: 'Euro',
            symbol: '€',
            count: 0
        },
        {
            code: 'GBP',
            name: 'British Pound',
            symbol: '£',
            count: 0
        },
        {
            code: 'JPY',
            name: 'Japanese Yen',
            symbol: '¥',
            count: 0
        },
        {
            code: 'CAD',
            name: 'Canadian Dollar',
            symbol: '$',
            count: 0
        },
        {
            code: 'AUD',
            name: 'Australian Dollar',
            symbol: '$',
            count: 0
        },
        {
            code: 'A/N',
            name: 'A/N',
            symbol: 'A/N',
            count: 0
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        tableData.map(async (currency, index) => {
            axios
                .get('/products', {
                    params: {
                        order_by: 'created_at',
                        desc: true,
                        currency: currency.code === 'A/N' ? 'null' : currency.code
                    }
                })
                .then((res) => {
                    const count = res.data.count;
                    setTableData((previous) => {
                        const updatedData = [...previous];
                        updatedData[index].count = count;
                        return updatedData;
                    });
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
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <MainCard content={false} title="Currency">
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <TableContainer>
                    {isLoading ? (
                        <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                            <CircularProgress aria-label="progress" />
                        </Grid>
                    ) : (
                        <Table sx={{ minWidth: 350 }} aria-label="simple table">
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ pl: 3 }}>No</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>Currency Code</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>Currency Name</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>Symbol</TableCell>
                                    <TableCell sx={{ textAlign: 'center' }}>Number of products</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tableData.map((row, index) => (
                                    <TableRow hover key={row.code}>
                                        <TableCell sx={{ pl: 3 }} component="th" scope="row">
                                            {index + 1}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            {row.count ? (
                                                <Link href={`/currency/detail?currency=${row.code}`} underline="hover">
                                                    {row.code}
                                                </Link>
                                            ) : (
                                                row.code
                                            )}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{row.name}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{row.symbol}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>{row.count}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </TableContainer>
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
