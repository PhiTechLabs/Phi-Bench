import { PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import s3 from "../config/s3.js";

export const uploadToS3 = async (
    file,
    folder = "documents"
) => {
    const extension =
        file.originalname.split(".").pop();

    const key =
        `${folder}/${uuidv4()}.${extension}`;

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
    });

    await s3.send(command);

    const url =
        `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return {
        key,
        url,
        name: file.originalname,
    };
};

export const getSignedFileUrl = async (key) => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
    });

    return await getSignedUrl(
        s3,
        command,
        {
            expiresIn: 300, // 5 minutes
        }
    );
};