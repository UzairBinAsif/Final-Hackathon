// import multer, { diskStorage } from "multer"
// import path from "path"

// const storage = diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, path.join(process.cwd(), "src/uploads"))
//     },

//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`)
//     }
// })

// export const upload = multer({ storage })
