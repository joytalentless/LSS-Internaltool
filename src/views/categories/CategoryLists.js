import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Fab,
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
    TableSortLabel,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import { IconSearch } from '@tabler/icons';
import AddIcon from '@mui/icons-material/AddTwoTone';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import axios from 'utils/axios';
import { dispatch } from 'store';
import { openSnackbar } from 'store/slices/snackbar';
import useAuth from 'hooks/useAuth';
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

// table header options
const headCells = [
    {
        id: 'name',
        numeric: false,
        label: 'Name (Product number)',
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
                    Description
                </TableCell>
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

// ==============================|| USER LIST ||============================== //

const CategoryLists = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();

    const [isLoading, setIsLoading] = React.useState(false);
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);
    const [filteredRows, setFilteredRows] = React.useState([]);

    const fetchCategory = useCallback((searchKeyWord) => {
        setIsLoading(true);
        axios
            .get('/categories/', { params: { is_active: true, search: searchKeyWord } })
            .then((resData) => {
                const categoryList = resData.data.map((categoryData) => ({
                    ...categoryData,
                    created_at: new Date(categoryData.created_at).toLocaleString(),
                    modified_at: new Date(categoryData.modified_at).toLocaleString()
                }));
                setRows(categoryList);
                setFilteredRows(categoryList);
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
    }, []);

    useEffect(() => {
        fetchCategory();
    }, [fetchCategory]);

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
        // setPage(0);
    };

    const handleCategoryDelete = async (row) => {
        try {
            await axios.delete(`/categories/${row.id}`);
            const newRows = rows.filter((rowi) => rowi.id !== row.id);
            setFilteredRows(newRows);
            setRows(newRows);
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Product delete succeed!',
                    variant: 'alert'
                })
            );
        } catch (err) {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: err.error,
                    variant: 'alert',
                    alert: {
                        color: 'warning'
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event?.target.value, 10));
        setPage(0);
    };

    const handleAddNewCategory = () => {
        navigate('/category/new');
    };

    return (
        <MainCard title="Category List" content={false}>
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
                                        if (e.key === 'Enter') fetchCategory(search);
                                    }}
                                    value={search}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Tooltip title="Add New Product Type">
                                    <Fab
                                        color="primary"
                                        size="small"
                                        onClick={handleAddNewCategory}
                                        sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </Fab>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <TableContainer>
                        {isLoading ? (
                            <Grid item sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, padding: '9px' }}>
                                <CircularProgress aria-label="progress" />
                            </Grid>
                        ) : (
                            <Table>
                                <EnhancedTableHead theme={theme} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                                {/* table content */}
                                <TableBody>
                                    {stableSort(filteredRows, getComparator(order, orderBy))
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => {
                                            /** Make sure no display bugs if row isn't an OrderData object */
                                            if (typeof row === 'number') return null;

                                            return (
                                                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                    <TableCell sx={{ pl: 3 }}>
                                                        <Typography align="center">{index + 1 + page * rowsPerPage}</Typography>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Link
                                                            href={`/category/detail?category_id=${row.id}`}
                                                            underline="hover"
                                                            sx={{ fontWeight: 'bold' }}
                                                        >
                                                            {row.name} ({row.product_count})
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{row.created_at}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{row.modified_at}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>{row.description}</TableCell>
                                                    <TableCell sx={{ textAlign: 'center' }}>
                                                        <Tooltip placement="top" title="Delete">
                                                            <IconButton
                                                                color="error"
                                                                size="large"
                                                                onClick={() => handleCategoryDelete(row)}
                                                            >
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
                            count={rows.length}
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

export default CategoryLists;
