import cloudinary from "../config/cloudinaryConfig.js";

export const uploadSingleImage = async (image, location) => {
  try {
    const b64 = Buffer.from(image, "base64").toString("base64");
    const dataUri = `data:image/jpeg;base64,${b64}`;
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: location || "Cravings", // Optional: specify a folder in Cloudinary
    });
    return {
      URL: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const uploadMultipleImages = async (images, location) => {
  try {
    const uploadPromises = images.map((image) =>
      uploadSingleImage(image, location),
    );
    const imageData = await Promise.all(uploadPromises);
    return imageData; // Return an array of objects with URL and publicId
  } catch (error) {
    console.error("Error uploading images:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result; // Return the result of the deletion
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const deleteMultipleImages = async (publicIds) => {
  try {
    const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
    const results = await Promise.all(deletePromises);
    return results; // Return an array of results for the deleted images
  } catch (error) {
    console.error("Error deleting images:", error);
    throw error; // Rethrow the error to be handled by the caller
  }
};

export const deleteImagesByFolder = async (folderPath) => {
  try {
    const result = await cloudinary.api.delete_resources_by_prefix(folderPath);
    return result;
  } catch (error) {
    console.error("Error deleting images by folder:", error);
    throw error;
  }
};
