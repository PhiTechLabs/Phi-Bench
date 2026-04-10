import bcrypt from "bcryptjs";

const run = async () => {
    const hash = await bcrypt.hash("229801", 10);
    console.log(hash);
};

run();