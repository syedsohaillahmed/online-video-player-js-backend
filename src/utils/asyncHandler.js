const asyncHandler = (fn) => {
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

// try catch method for error handling

// const asyncHandler = (fn)=> async (req, res, next)=>{
//     try {
//       await  fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             sucess: false,
//             message: error.message
//         })
//     }
// }
