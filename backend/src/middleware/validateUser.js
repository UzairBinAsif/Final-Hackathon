import jwt from "jsonwebtoken"

export const validateUser = (req, res, next) =>{
    try {
        let token = req.headers.authorization;

        if (token) {
            token = req.headers.authorization.split(" ")[1]
        }

        if (!token) throw new Error("No Token Provided", 400);
        const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log(decode);

        req.user = decode;
        next()
    } catch (error) {
        next(error)
    }
}