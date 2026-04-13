import bcrypt from "bcryptjs";

const run = async () => {
    const hash = await bcrypt.hash("229801", 10);
    const adminHash = await bcrypt.hash("admin123", 10);
    const clientHash = await bcrypt.hash("client123", 10);


    console.log(hash);
    console.log(adminHash);
    console.log(clientHash);
};

run();