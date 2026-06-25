// import asyncHandler from "express-async-handler";
// import { uploadToS3 } from "../services/s3Service.js";

// export const testUpload = asyncHandler(async (req, res) => {
//     if (!req.file) {
//         return res.status(400).json({
//             message: "No file uploaded",
//         });
//     }

//     const result = await uploadToS3(
//         req.file,
//         "test"
//     );

//     res.status(200).json({
//         message: "Upload successful",
//         file: result,
//     });
// });