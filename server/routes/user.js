const express = require("express")
const router = express.Router()

//Controllers
const {
    homePage,
    productDetails,
    shopPage,
} = require("../controllers/user/userController")
const {
    accountDetails,
    updateUser,
    userDashboard,
    addAddress,
    editAddress,
    manageAddress,
    orders,
    postAddress,
    updateAddress,
    deleteAddress,
} = require("../controllers/user/accountController")
const {
    signupPage,
    loginPage,
    registerUser,
    loginUser,
    logout,
    verifyOtp,
    validateOtp,
} = require("../controllers/user/authController")
const {
    cartPage,
    checkoutPage,
    addToCart,
    changeQuantity,
    deleteCartItem,
} = require("../controllers/user/cartController")
const {
    placeOrder,
    orderDetails,
    cancelOrder,
    successPage,
} = require("../controllers/user/orderController")

//Middlewares
const {
    protectedRoute,
    notProtectedRoute,
    isUserAuth,
} = require("../middleware/userAuth")
const validator = require("../middleware/express-validator")

//--------Routes-------

//Auth
router.route("/signup").get(isUserAuth, signupPage).post(registerUser)
router.route("/login").get(isUserAuth, loginPage).post(loginUser)
router.route("/logout").get(logout)
router.route("/verify").get(isUserAuth, verifyOtp).post(validateOtp)

//User
router.route("/").get(notProtectedRoute, homePage)
router.route("/shop").get(notProtectedRoute, shopPage)
router.route("/product/:id").get(notProtectedRoute, productDetails)

//Cart
router.route("/cart").get(protectedRoute, cartPage)
router.route("/add-to-cart").post(protectedRoute, addToCart)
router.route("/change-quantity").post(protectedRoute, changeQuantity)
router.route("/remove-cart/:id").get(protectedRoute, deleteCartItem)
router.route("/checkout").get(protectedRoute, checkoutPage)

//Order
router.route("/place-order").post(protectedRoute, placeOrder)
router.route("/order-details/:id").get(protectedRoute, orderDetails)
router.route("/order-cancel/:id").get(protectedRoute, cancelOrder)
router.route("/success-page").get(protectedRoute, successPage)

//account
router.route("/account").get(protectedRoute, userDashboard)
router.route("/account/account-details").get(protectedRoute, accountDetails)
router
    .route("/account/edit-user")
    .post(protectedRoute, validator.userValidation, updateUser)
router
    .route("/account/add-address")
    .get(protectedRoute, addAddress)
    .post(protectedRoute, validator.addressValidator, postAddress)
router
    .route("/account/edit-address/:id")
    .get(protectedRoute, editAddress)
    .post(protectedRoute, validator.addressValidator, updateAddress)
router.route("/account/delete-address/:id").get(protectedRoute, deleteAddress)
router.route("/account/manage-address").get(protectedRoute, manageAddress)
router.route("/account/orders").get(protectedRoute, orders)

module.exports = router
