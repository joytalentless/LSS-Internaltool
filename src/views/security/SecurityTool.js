import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import {
    Button,
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    Radio,
    RadioGroup,
    Grid,
    IconButton,
    InputAdornment,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableSortLabel,
    TableContainer,
    TablePagination,
    TableHead,
    TableRow,
    Tooltip,
    Toolbar,
    Stack,
    TextField,
    Divider,
    Dialog,
    DialogContent,
    DialogContentText,
    DialogActions,
    Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import InputLabel from 'ui-component/extended/Form/InputLabel';

// assets
import Chip from 'ui-component/extended/Chip';

// third-party
import * as yup from 'yup';
import { useFormik } from 'formik';
import useAuth from 'hooks/useAuth';

// yup validation-schema
const validationSchema = yup.object({
    startip: yup.string().required('IP address is Required'),
    endip: yup.string().required('IP address is Required'),
    ip: yup.string().required('IP address is Required')
});

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
        id: 'type',
        numeric: false,
        label: 'Single IP/IP Range',
        align: 'center'
    },
    {
        id: 'ip_address',
        numeric: true,
        label: 'Blocked IP Address',
        align: 'center'
    }
];

// ==============================|| TABLE HEADER ||============================== //

function EnhancedTableHead({ onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort, theme, selected }) {
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

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
                {numSelected <= 0 && (
                    <TableCell sortDirection={false} align="left">
                        <Typography variant="subtitle1" sx={{ color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.900' }}>
                            #
                        </Typography>
                    </TableCell>
                )}
                {numSelected > 0 && (
                    <TableCell padding="none" colSpan={8}>
                        <EnhancedTableToolbar numSelected={selected.length} />
                    </TableCell>
                )}
                {numSelected <= 0 &&
                    headCells.map((headCell) => (
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
    theme: PropTypes.object,
    selected: PropTypes.array,
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired
};

// ==============================|| TABLE HEADER TOOLBAR ||============================== //

const EnhancedTableToolbar = ({ numSelected }) => (
    <Toolbar
        sx={{
            p: 0,
            pl: 1,
            pr: 1,
            ...(numSelected > 0 && {
                color: (theme) => theme.palette.secondary.main
            })
        }}
    >
        {numSelected > 0 ? (
            <Typography color="inherit" variant="h4">
                {numSelected} Selected
            </Typography>
        ) : (
            <Typography variant="h6" id="tableTitle">
                Nutrition
            </Typography>
        )}
        <Box sx={{ flexGrow: 1 }} />
        {numSelected > 0 && (
            <Tooltip title="Delete">
                <IconButton size="large">
                    <DeleteIcon fontSize="small" />
                </IconButton>
            </Tooltip>
        )}
    </Toolbar>
);

EnhancedTableToolbar.propTypes = {
    numSelected: PropTypes.number.isRequired
};

// ==============================|| IP BLACK LIST ||============================== //

const SecurityTool = () => {
    const { user: myInfo } = useAuth();
    const theme = useTheme();
    // const navigate = useNavigate();

    const data = [
        {
            id: '1',
            type: '1',
            ip_address: '25.16.24.25'
        },
        {
            id: '2',
            type: '2',
            ip_address: '25.16.24.25'
        },
        {
            id: '3',
            type: '1',
            ip_address: '25.16.24.25'
        },
        {
            id: '4',
            type: '2',
            ip_address: '25.16.24.25'
        },
        {
            id: '5',
            type: '2',
            ip_address: '25.16.24.25'
        },
        {
            id: '6',
            type: '1',
            ip_address: '25.16.24.25'
        },
        {
            id: '7',
            type: '2',
            ip_address: '25.16.24.25'
        },
        {
            id: '8',
            type: '1',
            ip_address: '25.16.24.25'
        },
        {
            id: '9',
            type: '1',
            ip_address: '25.16.24.25'
        },
        {
            id: '10',
            type: '2',
            ip_address: '212.256.24.25'
        },
        {
            id: '11',
            type: '1',
            ip_address: '225.16.24.25'
        },
        {
            id: '12',
            type: '1',
            ip_address: '125.16.24.25'
        }
    ];

    const [open, setOpen] = useState(false);
    const [currentIpAddPolicy, setCurrentIpAddPolicy] = React.useState('singleip');

    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('name');
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(100);
    const [search, setSearch] = React.useState('');
    const [rows, setRows] = React.useState([]);

    useEffect(() => {
        setRows(data);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const formik = useFormik({
        initialValues: {
            startip: '',
            endip: '',
            ip: ''
        },
        validationSchema,
        onSubmit: (values) => {
            if (values) {
                setOpen(true);
            }
        }
    });

    const handleSearch = (event) => {
        const newString = event?.target.value;
        setSearch(newString || '');
        if (newString) {
            const newRows = data.filter((row) => {
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
            setRows(data);
        }
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            if (selected.length > 0) {
                setSelected([]);
            } else {
                const newSelectedId = rows.map((n) => n.name);
                setSelected(newSelectedId);
            }
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, name);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event?.target.value, 10));
        setPage(0);
    };

    const handleDialogOk = () => {
        setOpen(false);
        formik.resetForm();
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    return (
        <MainCard title="IP Block Tool" content={false}>
            {myInfo && myInfo.role && myInfo.role.name === 'super_user' ? (
                <Grid item xs={12} sx={{ p: 3 }}>
                    <form onSubmit={formik.handleSubmit}>
                        <Grid container spacing={gridSpacing}>
                            <Grid item>
                                <FormControl>
                                    <RadioGroup
                                        row
                                        aria-label="ipaddpolicy"
                                        value={currentIpAddPolicy}
                                        onChange={(e) => setCurrentIpAddPolicy(e.target.value)}
                                        name="ip-radio-buttons-group"
                                    >
                                        <FormControlLabel value="singleip" control={<Radio />} label="Add a Single IP" />
                                        <FormControlLabel value="multipleip" control={<Radio />} label="Add IP range" />
                                    </RadioGroup>
                                </FormControl>
                            </Grid>
                        </Grid>
                        <Grid container spacing={gridSpacing}>
                            {currentIpAddPolicy === 'multipleip' && (
                                <>
                                    <Grid item xs={12} md={6}>
                                        <Stack>
                                            <TextField
                                                id="startip"
                                                name="startip"
                                                value={formik.values.startip}
                                                helperText={formik.touched.startip && formik.errors.startip}
                                                fullWidth
                                                placeholder="xxx.xxx.xxx.xxx"
                                            />
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Stack>
                                            <TextField
                                                id="endip"
                                                name="endip"
                                                value={formik.values.endip}
                                                helperText={formik.touched.endip && formik.errors.endip}
                                                fullWidth
                                                placeholder="xxx.xxx.xxx.xxx"
                                            />
                                        </Stack>
                                    </Grid>
                                </>
                            )}
                            {currentIpAddPolicy === 'singleip' && (
                                <Grid item xs={12} md={12}>
                                    <Stack>
                                        <TextField
                                            id="ip"
                                            name="ip"
                                            value={formik.values.ip}
                                            helperText={formik.touched.ip && formik.errors.ip}
                                            fullWidth
                                            placeholder="xxx.xxx.xxx.xxx"
                                        />
                                    </Stack>
                                </Grid>
                            )}
                            <Grid item sx={{ display: 'flex', justifyContent: 'flex-end' }} xs={12}>
                                <Button variant="contained" type="submit">
                                    Add
                                </Button>
                            </Grid>
                            <Grid item>
                                <Dialog open={open}>
                                    <DialogContent>
                                        <DialogContentText sx={{ fontWeight: 500, color: `secondary.dark` }}>
                                            Invoice Created Successfully
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions sx={{ pr: '20px' }}>
                                        <Button autoFocus variant="contained" onClick={handleDialogOk}>
                                            Ok
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                        </Grid>
                    </form>
                    <Grid container justifyContent="start" spacing={2}>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            <InputLabel>BlackList</InputLabel>
                        </Grid>
                    </Grid>
                    <CardContent>
                        <Grid container justifyContent="start" alignItems="center" spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }}
                                    onChange={handleSearch}
                                    placeholder="Search Order"
                                    value={search}
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                    {/* table */}
                    <TableContainer>
                        <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle">
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={rows.length}
                                theme={theme}
                                selected={selected}
                            />
                            <TableBody>
                                {stableSort(rows, getComparator(order, orderBy))
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((row, index) => {
                                        /** Make sure no display bugs if row isn't an OrderData object */
                                        if (typeof row === 'number') return null;

                                        const isItemSelected = isSelected(row.name);
                                        const labelId = `enhanced-table-checkbox-${index}`;

                                        return (
                                            <TableRow
                                                hover
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={index}
                                                selected={isItemSelected}
                                            >
                                                <TableCell
                                                    padding="checkbox"
                                                    sx={{ pl: 3 }}
                                                    onClick={(event) => handleClick(event, row.name)}
                                                >
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        inputProps={{
                                                            'aria-labelledby': labelId
                                                        }}
                                                    />
                                                </TableCell>
                                                <TableCell
                                                    component="th"
                                                    id={labelId}
                                                    scope="row"
                                                    onClick={(event) => handleClick(event, row.name)}
                                                    sx={{ cursor: 'pointer' }}
                                                >
                                                    <Typography
                                                        variant="subtitle1"
                                                        sx={{ color: theme.palette.mode === 'dark' ? 'grey.600' : 'grey.900' }}
                                                    >
                                                        {row.id}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="center">
                                                    {row.type === '1' && <Chip label="Single IP" size="small" chipcolor="grey" />}
                                                    {row.type === '2' && <Chip label="IP Range" size="small" chipcolor="orange" />}
                                                </TableCell>
                                                <TableCell align="center">{row.ip_address}</TableCell>
                                                <TableCell sx={{ textAlign: 'center' }}>
                                                    <Tooltip placement="top" title="Delete">
                                                        <IconButton color="error" size="large">
                                                            <DeleteForeverIcon sx={{ fontSize: '1.1rem' }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </TableContainer>
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

export default SecurityTool;
