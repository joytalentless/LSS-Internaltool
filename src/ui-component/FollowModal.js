/* eslint-disable no-nested-ternary */
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';

// material-ui
import { Avatar, Divider, Grid, Link, Modal, Typography, Pagination } from '@mui/material';

// project imports
import axios from 'utils/axios';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// ==============================|| MODAL ||============================== //

function FollowModal({ type, openModal, handleOpenDialog, userId, userName, totalCount }) {
    const [page, setPage] = useState(1);
    const [renderData, setRenderData] = useState([]);
    const pageSize = 6;

    useEffect(() => {
        if (openModal) {
            setPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openModal, type]);

    const fetchData = useCallback(async () => {
        let newPage = page;
        const totalPage = Math.ceil(totalCount / pageSize);
        if (totalPage > 0 && newPage > totalPage) {
            newPage = totalPage;
            setPage(totalPage);
        }

        if (type === 'Likes') {
            try {
                const response = await axios.get('/users/like/products', {
                    params: {
                        user_id: userId,
                        p: page,
                        page_size: pageSize
                    }
                });
                setRenderData(response.data.results);
            } catch (error) {
                console.error(error);
            }
        } else if (type === 'Followers') {
            try {
                const response = await axios.get('/users/followers/', {
                    params: {
                        user_id: userId,
                        p: page,
                        page_size: pageSize,
                        is_active: true,
                        is_accepted: true,
                        is_deleted: false
                    }
                });
                setRenderData(response.data.results);
            } catch (error) {
                console.error(error);
            }
        } else {
            try {
                const response = await axios.get('/users/followees/', {
                    params: {
                        user_id: userId,
                        p: page,
                        page_size: pageSize,
                        is_active: true,
                        is_accepted: true,
                        is_deleted: false
                    }
                });
                setRenderData(response.data.results);
            } catch (error) {
                console.error(error);
            }
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, type]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return (
        <Modal open={openModal} onClose={handleOpenDialog} aria-labelledby="simple-modal-title" aria-describedby="simple-modal-description">
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
                                {type === 'Likes'
                                    ? `The products ${userName} like`
                                    : type === 'Following'
                                    ? `The people ${userName} follow`
                                    : `The people following ${userName}`}
                            </Typography>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider />
                        </Grid>
                        <Grid item xs={12}>
                            {renderData &&
                                renderData.map((row, index) => {
                                    const displayData = type === 'Likes' ? row.product : type === 'Following' ? row.followee : row.follower;
                                    let variant;
                                    let media;
                                    let url;
                                    if (type === 'Likes') {
                                        variant =
                                            displayData &&
                                            displayData.variants.filter((item) => item.is_active).sort((a, b) => a.index - b.index)[0];
                                        media =
                                            variant &&
                                            variant.media &&
                                            variant.media.filter((item) => item.is_active).sort((a, b) => a.index - b.index)[0];
                                        url = media
                                            ? process.env.REACT_APP_MEDIA_BASE_URL +
                                              process.env.REACT_APP_MEDIA_THUMBNAIL_LOCATION +
                                              media.url
                                            : '';
                                    }
                                    return (
                                        <Grid
                                            key={`list-${index}`}
                                            sx={{
                                                display: 'flex',
                                                gap: '16px',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                margin: '10px'
                                            }}
                                        >
                                            <Link
                                                href={
                                                    type === 'Likes'
                                                        ? `/product/detail?product_id=${displayData && displayData.id}`
                                                        : `/user/detail?user_id=${displayData && displayData.id}`
                                                }
                                                underline="hover"
                                            >
                                                <Avatar
                                                    src={type === 'Likes' ? url : displayData && displayData.avatar_url}
                                                    alt={
                                                        type === 'Likes'
                                                            ? displayData && displayData.name
                                                            : displayData && displayData.username
                                                    }
                                                    name={
                                                        type === 'Likes'
                                                            ? displayData && displayData.name
                                                            : displayData && displayData.username
                                                    }
                                                    sx={{
                                                        width: 64,
                                                        height: 64,
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            </Link>
                                            <Grid
                                                sx={{
                                                    display: 'flex',
                                                    py: '9.5px',
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <Grid sx={{ display: 'flex', flexDirection: 'column', marginRight: 'auto' }}>
                                                    <Typography
                                                        noWrap
                                                        sx={{
                                                            fontSize: '18px',
                                                            fontWeight: '600',
                                                            maxWidth: { xs: 130, sm: 200, md: 220, lg: 260, xl: 260 }
                                                        }}
                                                    >
                                                        {type === 'Likes'
                                                            ? displayData && displayData.name
                                                            : displayData && displayData.username}
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    );
                                })}
                        </Grid>
                        <Pagination
                            shape="rounded"
                            page={page}
                            count={Math.ceil(totalCount / pageSize)}
                            variant="outlined"
                            siblingCount={1}
                            sx={{ marginX: 'auto' }}
                            onChange={(e, p) => {
                                setPage(p);
                            }}
                        />
                    </Grid>
                </MainCard>
            </div>
        </Modal>
    );
}

FollowModal.propTypes = {
    type: PropTypes.string.isRequired,
    openModal: PropTypes.bool.isRequired,
    handleOpenDialog: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
    userName: PropTypes.string,
    totalCount: PropTypes.number
};

export default FollowModal;
