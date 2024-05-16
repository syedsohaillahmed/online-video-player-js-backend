const asyncHandler = (fn) => {
 return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};

export {asyncHandler}

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
