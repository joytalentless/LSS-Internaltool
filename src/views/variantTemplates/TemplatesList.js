import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Box,
    Fab,
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
// import axios from 'utils/axios';
// import { dispatch } from 'store';
// import { openSnackbar } from 'store/slices/snackbar';
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

const data = [
    {
        id: 1,
        name: 'Name-11',
        temp_metadata: [
            {
                id: 11,
                index: 11,
                field: 'Field-11',
                value: 'Value-11',
                is_active: true
            },
            {
                id: 111,
                index: 111,
                field: 'Field-12',
                value: 'Value-12',
                is_active: true
            },
            {
                id: 1111,
                index: 1111,
                field: 'Field-13',
                value: 'Value-13',
                is_active: false
            }
        ],
        created_at: '2023-10-18 20:45:48.351 -0400',
        modified_at: '2023-10-18 20:45:06.348 -0400'
    },
    {
        id: 2,
        name: 'Name-22',
        temp_metadata: [
            {
                id: 22,
                index: 22,
                field: 'Field-21',
                value: 'Value-21',
                is_active: true
            },
            {
                id: 222,
                index: 222,
                field: 'Field-22',
                value: 'Value-22',
                is_active: false
            },
            {
                id: 2222,
                index: 2222,
                field: 'Field-23',
                value: 'Value-23',
                is_active: true
            }
        ],
        created_at: '2023-10-19 18:08:39.384 -0400',
        modified_at: '2023-10-19 18:08:39.382 -0400'
    },
    {
        id: 3,
        name: 'Name-33',
        temp_metadata: [
            {
                id: 33,
                index: 33,
                field: 'Field-31',
                value: 'Value-31',
                is_active: true
            },
            {
                id: 333,
                index: 333,
                field: 'Field-32',
                value: 'Value-32',
                is_active: true
            },
            {
                id: 3333,
                index: 3333,
                field: 'Field-33',
                value: 'Value-33',
                is_active: true
            }
        ],
        created_at: '2023-10-19 18:08:44.325 -0400',
        modified_at: '2023-10-19 18:08:44.323 -0400'
    }
];

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
        label: 'Name',
        align: 'center'
    },
    {
        id: 'template_metadata',
        numeric: true,
        label: 'Count of Metadata',
        align: 'center'
    },
    {
        id: 'created_at',
        numeric: false,
        label: 'Created Time',
        align: 'center'
    },
    {
        id: 'modified_at',
        numeric: false,
        label: 'Last Updated Time',
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

// ==============================|| USER LIST ||============================== //

const ProductLists = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    const navigate = useNavigate();

    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);
    const [totalCount, setTotalCount] = React.useState(0);

    useEffect(() => {
        setRows(data);
        setTotalCount(data.length);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
        if (newString) {
            const newRows = rows.filter((row) => {
                let matches = true;

                const properties = ['name'];
                let containsQuery = false;
                properties.forEach((property) => {
                    if (row[property].toString().toLowerCase().includes(newString.toString().toLowerCase())) {
                        containsQuery = true;
                    }
                });

                if (!containsQuery) {
                    matches = false;
                }
                return matches;
            });
            setRows(newRows);
        } else {
            setRows(rows);
        }
    };

    const handleProductDelete = async (row) => {
        // try {
        //     await axios.delete(`/products/${row.id}`);
        const newRows = rows.filter((rowi) => rowi.id !== row.id);
        setRows(newRows);
        //     dispatch(
        //         openSnackbar({
        //             open: true,
        //             anchorOrigin: { vertical: 'top', horizontal: 'right' },
        //             message: 'Product delete succeed!',
        //             variant: 'alert'
        //         })
        //     );
        // } catch (err) {
        //     dispatch(
        //         openSnackbar({
        //             open: true,
        //             anchorOrigin: { vertical: 'top', horizontal: 'right' },
        //             message: 'Delete is failed!',
        //             variant: 'alert',
        //             alert: {
        //                 color: 'error'
        //             }
        //         })
        //     );
        // }
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

    const handleAddNewProduct = () => {
        navigate('/product/new');
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <MainCard title="Product List" content={false}>
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
                                    value={search}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} sx={{ textAlign: 'right' }}>
                                <Tooltip title="Add Product">
                                    <Fab
                                        color="primary"
                                        size="small"
                                        onClick={handleAddNewProduct}
                                        sx={{ boxShadow: 'none', ml: 1, width: 32, height: 32, minHeight: 32 }}
                                    >
                                        <AddIcon fontSize="small" />
                                    </Fab>
                                </Tooltip>
                            </Grid>
                        </Grid>
                    </CardContent>
                    <TableContainer>
                        <Table>
                            <EnhancedTableHead theme={theme} order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                            {/* table content */}
                            <TableBody>
                                {stableSort(rows, getComparator(order, orderBy)).map((row, index) => {
                                    /** Make sure no display bugs if row isn't an OrderData object */
                                    if (typeof row === 'number') return null;

                                    return (
                                        <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                            <TableCell sx={{ pl: 3 }}>
                                                <Typography align="center">{index + 1 + page * rowsPerPage}</Typography>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Link href={`/product/variation/template/detail?product_id=${row.id}`} underline="hover">
                                                    {row.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                {row.temp_metadata.filter((item) => item.is_active === true).length}
                                            </TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>{new Date(row.created_at).toLocaleString()}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>{new Date(row.modified_at).toLocaleString()}</TableCell>
                                            <TableCell sx={{ textAlign: 'center' }}>
                                                <Tooltip placement="top" title="Delete">
                                                    <IconButton color="error" size="large" onClick={() => handleProductDelete(row)}>
                                                        <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: 53 * emptyRows
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
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

export default ProductLists;
