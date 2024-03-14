import PropTypes from 'prop-types';

import React, { useState, useEffect } from 'react';
import './ImageUploader.css';

// Project import
import Uploader from './Uploader';
import Preview from './Preview';

const ImageUploader = ({ existImages, addMedia, updateMedia, deleteMedia, uploadable }) => {
    const [imagesPreviewUrls, setImagesPreviewUrls] = useState([]);

    useEffect(() => {
        if (existImages) {
            setImagesPreviewUrls([...existImages]);
        } else {
            setImagesPreviewUrls([]);
        }
    }, [existImages]);

    const addImagePreviewUrl = (results) => {
        setImagesPreviewUrls([...imagesPreviewUrls, ...results]);
        addMedia(imagesPreviewUrls.length, results);
    };

    const deleteImage = (id, index) => {
        const filterImages = imagesPreviewUrls.filter((image) => image.id !== id);
        setImagesPreviewUrls(filterImages);
        deleteMedia(index);
    };

    const updateIndex = (newImages) => {
        updateMedia(newImages);
        setImagesPreviewUrls(newImages);
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Uploader imagesPreviewUrls={addImagePreviewUrl} uploadable={uploadable} />
            </div>
            <div style={{ border: '1px dashed #afafaf', borderRadius: '9px', margin: '8px', cursor: 'pointer' }}>
                {imagesPreviewUrls?.length > 0 ? (
                    <Preview imagesPreviewUrls={imagesPreviewUrls} deleteImage={deleteImage} updateIndex={updateIndex} />
                ) : null}
                {/* {existImages?.length > 0 ? <Preview imagesPreviewUrls={existImages} deleteImage={deleteImage} isNew={false} /> : null} */}
            </div>
        </>
    );
};
export default ImageUploader;

ImageUploader.propTypes = {
    existImages: PropTypes.array,
    addMedia: PropTypes.func,
    updateMedia: PropTypes.func,
    deleteMedia: PropTypes.func,
    uploadable: PropTypes.bool
};
