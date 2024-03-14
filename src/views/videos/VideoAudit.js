import React, { useCallback, useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
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
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DownloadIcon from '@mui/icons-material/Download';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import { IconSearch } from '@tabler/icons';

import axios from 'utils/axios';
import { getMediaType } from 'utils/formatString';
import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';
import useAuth from 'hooks/useAuth';

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead() {
    return (
        <TableHead>
            <TableRow>
                <TableCell align="center">Product ID</TableCell>
                <TableCell align="center">Product Name</TableCell>
                <TableCell align="center">Media</TableCell>
                <TableCell align="center">Source URL</TableCell>
                <TableCell align="center">File Size</TableCell>
                <TableCell align="center">Last Modified</TableCell>
                <TableCell align="center">Published at</TableCell>
                <TableCell sortDirection={false} align="center" sx={{ pr: 3 }}>
                    Action
                </TableCell>
            </TableRow>
        </TableHead>
    );
}

// ==============================|| USER LIST ||============================== //

const VideoAuditLists = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const dispatch = useDispatch();

    const [isLoading, setIsLoading] = React.useState(false);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('name');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(100);
    const [search, setSearch] = useState('');
    const [rows, setRows] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    const fetchProductList = useCallback(
        (searchKeyWord) => {
            setIsLoading(true);
            axios
                .get('/products/video-audit/', {
                    params: {
                        p: page + 1,
                        desc: true,
                        page_size: rowsPerPage,
                        search: searchKeyWord
                    }
                })
                .then((resData) => {
                    const productList = resData.data.results.map((productData) => ({
                        ...productData,
                        url: process.env.REACT_APP_MEDIA_BASE_URL + process.env.REACT_APP_MEDIA_THUMBNAIL_LOCATION + productData.url,
                        originURL: process.env.REACT_APP_MEDIA_BASE_URL + process.env.REACT_APP_MEDIA_UPLOAD_LOCATION + productData.url
                    }));
                    setRows(productList);
                    setTotalCount(resData.data.count);
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
        [page, rowsPerPage]
    );

    useEffect(() => {
        fetchProductList();
    }, [fetchProductList]);

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
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
        return longUrl.length > maxDisplayChars ? `${longUrl.substring(0, maxDisplayChars)}...` : longUrl;
    };

    const handleDownload = async (videoUrl) => {
        try {
            const aTag = document.createElement('a');
            aTag.href = videoUrl;
            document.body.appendChild(aTag);
            aTag.click();
            aTag.remove();
        } catch (error) {
            console.error('Error downloading video:', error);
        }
    };

    const handleAssetDelete = async (id) => {
        try {
            await axios.delete(`/mediadelete/${id}`);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Assets delete succeed!',
                    variant: 'alert'
                })
            );
            const newRows = rows.filter((row) => row.id !== id);
            setRows(newRows);
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

    return (
        <MainCard title="Video Audit" content={false}>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <>
                    <CardContent>
                        <Grid container alignItems="center" justifyContent="space-between" spacing={gridSpacing}>
                            <Grid item>
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
                                        if (e.key === 'Enter') fetchProductList(search);
                                    }}
                                    value={search}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    <TableContainer sx={{ overflow: 'visible' }}>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table sx={{ overflow: 'visible' }}>
                                <EnhancedTableHead theme={theme} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                <TableBody sx={{ overflow: 'visible' }}>
                                    {rows.map((row, index) => {
                                        if (typeof row === 'number') return null;
                                        // const variant = row.variants.filter((item) => item.is_active).sort((a, b) => a.index - b.index)[0];
                                        // const media =
                                        //     variant &&
                                        //     variant.media &&
                                        //     variant.media.filter((item) => item.is_active).sort((a, b) => a.index - b.index)[0];
                                        // const url = media ? media.url : '';

                                        return (
                                            <TableRow hover tabIndex={-1} key={index}>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link
                                                        variant="subtitle1"
                                                        href={`/product/detail?product_id=${row.id}`}
                                                        underline="hover"
                                                    >
                                                        {row.product_id}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link
                                                        variant="subtitle1"
                                                        href={`/product/detail?product_id=${row.product_id}`}
                                                        underline="hover"
                                                    >
                                                        {shortenUrl(row.product_name)}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link href={`/product/detail?product_id=${row.product_id}`} fontWeight="bold">
                                                        {
                                                            // eslint-disable-next-line no-nested-ternary
                                                            row.url ? (
                                                                getMediaType(row.url) === 'image' ? (
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
                                                                            key={row.url}
                                                                            src={row.url}
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
                                                                            key={row.url}
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
                                                                            <source key={row.url} src={row.url} />
                                                                        </video>
                                                                    </Box>
                                                                )
                                                            ) : (
                                                                <>No media</>
                                                            )
                                                        }
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Link variant="subtitle1" href={`${row.originURL}`} target="_blank" underline="hover">
                                                        {shortenUrl(row.originURL)}
                                                    </Link>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Typography>{row.filesize?.toString().substring(0, 4)} MB</Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Typography>{new Date(row.modified_at).toLocaleString()}</Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Typography>
                                                        {row.product_published_at
                                                            ? new Date(row.product_published_at).toLocaleString()
                                                            : ''}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Tooltip placement="top" title="Download">
                                                        <IconButton color="primary" size="large" onClick={() => handleDownload(row.url)}>
                                                            <DownloadIcon sx={{ fontSize: '1.1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip placement="top" title="Delete">
                                                        <IconButton color="error" size="large" onClick={() => handleAssetDelete(row.id)}>
                                                            <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
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

export default VideoAuditLists;
