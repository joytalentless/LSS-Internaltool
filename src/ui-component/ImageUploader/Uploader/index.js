import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { openSnackbar } from 'store/slices/snackbar';
import { useDispatch } from 'store';

const Uploader = ({ imagesPreviewUrls, uploadable }) => {
    const dispatch = useDispatch();
    const [imgUploadable, setImgUploadable] = useState(uploadable);
    const [imageValidationError, setImageValidationError] = useState(null);

    useEffect(() => {
        setImgUploadable(uploadable);
    }, [uploadable]);

    const checkMimeType = (event) => {
        const { files } = event.target;
        let err = '';
        const types = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'video/mp4'];
        for (let x = 0; x < files.length; x += 1) {
            if (types.every((type) => files[x].type !== type)) {
                err += `${files[x].type} is not a supported format\n`;
            }
        }

        if (err !== '') {
            event.target.value = null;
            setImageValidationError(err);
            return false;
        }
        return true;
    };

    const filesSelectedHandler = (e) => {
        console.log(imgUploadable);
        if (checkMimeType(e) && imgUploadable) {
            const files = Array.from(e.target.files);
            const results = [];
            Promise.all(
                // eslint-disable-next-line arrow-body-style
                files.map((file) => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const result = {
                                file: reader.result,
                                size: file.size,
                                name: file.name,
                                fileInfo: file,
                                isNew: true
                            };
                            resolve(result);
                        };
                        reader.onerror = (error) => {
                            reject(error);
                        };
                        reader.readAsDataURL(file);
                    });
                })
            )
                .then((processedResults) => {
                    const newResults = [...results, ...processedResults];
                    imagesPreviewUrls(newResults); // Call imagesPreviewUrls once with full results
                })
                .catch((error) => {
                    console.error('Error processing files:', error);
                    // Handle any errors during file reading
                });
        } else {
            dispatch(
                openSnackbar({
                    open: true,
                    anchorOrigin: { vertical: 'top', horizontal: 'right' },
                    message: 'Please create variation first!',
                    variant: 'alert',
                    alert: {
                        color: 'warning'
                    }
                })
            );
        }
    };

    return (
        <>
            <div id="main">
                <input
                    type="file"
                    name="file"
                    id="file"
                    className="custom-file-input"
                    onChange={filesSelectedHandler}
                    accept="image/png, image/jpeg, image/webp, video/mp4"
                    multiple
                    style={{ cursor: 'pointer' }}
                />
                {imageValidationError ? (
                    <p className="error-msg">{imageValidationError}</p>
                ) : (
                    <p style={{ cursor: 'pointer' }}>Drag your images here or click in this area to upload media files for product</p>
                )}
            </div>
        </>
    );
};

Uploader.propTypes = {
    imagesPreviewUrls: PropTypes.func,
    uploadable: PropTypes.bool
};

export default Uploader;
