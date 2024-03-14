/* eslint-disable jsx-a11y/media-has-caption */
import { Box, Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import ImageViewer from 'react-simple-image-viewer';
// MUI
import CancelIcon from '@mui/icons-material/Cancel';
import { getMediaType } from 'utils/formatString';
// const videoPreviewImage = require.context('assets/images/defaultVideo', true);
// const prodcutImage = require.context('assets/images/products', true);

// function getMimeType(fileString) {
//     const matches = fileString.match(/^data:([^/]+)/);
//     if (matches) {
//         const mimetype = matches[1];
//         return mimetype; // Output: image
//     }
//     return '';
// }

const Preview = ({ imagesPreviewUrls, deleteImage, updateIndex }) => {
    const [previewImages, setPreviewImages] = useState([]);
    const [currentImage, setCurrentImage] = useState(0);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [dragId, setDragId] = useState('');
    const detailedImages = previewImages.map((obj) => obj.url);

    useEffect(() => {
        setPreviewImages(imagesPreviewUrls);
    }, [imagesPreviewUrls]);

    const deleteImageItem = (id, index) => {
        deleteImage(id, index);
    };

    const handleOver = (ev) => {
        ev.preventDefault();
    };

    const handleDrag = (ev) => {
        setDragId(ev.currentTarget.id);
    };

    const moveItem = (from, to) => {
        const newPreviewImages = [...previewImages];
        const f = newPreviewImages.splice(from, 1)[0];
        newPreviewImages.splice(to, 0, f);
        return newPreviewImages;
    };

    const handleDrop = (ev) => {
        ev.preventDefault();
        // eslint-disable-next-line eqeqeq
        const dragImage = previewImages.find((image) => image.id == dragId);
        // eslint-disable-next-line eqeqeq
        const dropImage = previewImages.find((image) => image.id == ev.currentTarget.id);
        const arr = moveItem(dragImage.id - 1, dropImage.id - 1);

        setPreviewImages(arr);
        // eslint-disable-next-line array-callback-return
        arr.map((items, index) => {
            items.id = index + 1;
        });
        updateIndex(arr);
    };

    // const openImageViewer = useCallback((index) => {
    //     setCurrentImage(index);
    //     setIsViewerOpen(true);
    // }, []);

    const closeImageViewer = () => {
        setCurrentImage(0);
        setIsViewerOpen(false);
    };

    const renderPreview = () => {
        if (previewImages.length > 0) {
            // eslint-disable-next-line array-callback-return
            previewImages.map((items, index) => {
                items.id = index + 1;
            });
        }
        return (
            <>
                {previewImages.length > 0 &&
                    previewImages.map((element, index) => (
                        <Box
                            className="gallery"
                            key={index}
                            id={element.id}
                            draggable
                            onDragOver={(e) => handleOver(e)}
                            onDragStart={(e) => handleDrag(e)}
                            onDrop={(e) => handleDrop(e)}
                            sx={{
                                backdropFilter: 'blur(1px)',
                                aspectRatio: '1',
                                transition: 'transform 0.3s ease-in-out',
                                '&:hover': {
                                    transform: 'scale(2) translateY(-20px)',
                                    zIndex: 9999
                                }
                            }}
                        >
                            {
                                // eslint-disable-next-line no-nested-ternary
                                element.isNew ? (
                                    <img
                                        src={element.file}
                                        key={index}
                                        alt={element.name}
                                        // onClick={(e) => openImageViewer(index)}
                                        tabIndex={0}
                                        // onKeyDown={(e) => {
                                        //     if (e.key === 'Enter') {
                                        //         openImageViewer(index);
                                        //     }
                                        // }}
                                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                                        role="button"
                                        style={{ aspectRatio: '1', borderRadius: '8px', border: '1px solid #777' }}
                                    />
                                ) : getMediaType(element.url) === 'image' ? (
                                    <img
                                        style={{ aspectRatio: '1', borderRadius: '8px', border: '1px solid #777' }}
                                        src={element.url}
                                        key={index}
                                        alt={element.name}
                                        // onClick={() => openImageViewer(index)}
                                        tabIndex={0}
                                        // onKeyDown={(e) => {
                                        //     if (e.key === 'Enter') {
                                        //         openImageViewer(index);
                                        //     }
                                        // }}
                                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                                        role="button"
                                    />
                                ) : (
                                    <video
                                        autoPlay
                                        muted
                                        loop
                                        key={index}
                                        width="100%"
                                        style={{ aspectRatio: '1', borderRadius: '8px', objectFit: 'cover', border: '1px solid #777' }}
                                        // onClick={() => openImageViewer(index)}
                                    >
                                        <source key={index} src={element.url} />
                                    </video>
                                )
                            }
                            <Button
                                variant="contained"
                                color="grey"
                                sx={{
                                    borderRadius: 50,
                                    minWidth: 0,
                                    padding: 0,
                                    position: 'absolute',
                                    top: -6,
                                    right: -6,
                                    background: 'white'
                                }}
                                onClick={() => deleteImageItem(element.id, element.index)}
                            >
                                <CancelIcon />
                            </Button>
                        </Box>
                    ))}
                {isViewerOpen && (
                    <ImageViewer
                        src={detailedImages}
                        currentIndex={currentImage}
                        onClose={closeImageViewer}
                        disableScroll={false}
                        backgroundStyle={{
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            zIndex: 999999,
                            width: '100%'
                        }}
                        closeOnClickOutside
                    />
                )}
            </>
        );
    };

    return <div className="wrapper">{renderPreview()}</div>;
};

Preview.propTypes = {
    imagesPreviewUrls: PropTypes.any,
    deleteImage: PropTypes.func,
    updateIndex: PropTypes.func
};

export default Preview;
