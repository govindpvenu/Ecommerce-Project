const asyncHandler = require("express-async-handler")
const Product = require("../../models/Product")
const Category = require("../../models/Category")
const Order = require("../../models/Order")

//GET
//@route/
const homePage = asyncHandler(async (req, res) => {
    const allProducts = await Product.find({
        $and: [
            { stock_status: "Available" },
            { is_Listed: true },
            { "category.is_Listed": true },
        ],
    })

    const brands = await Product.aggregate([
        {
            $match: {
                $and: [
                    { stock_status: "Available" },
                    { is_Listed: true },
                    { "category.is_Listed": true },
                ],
            },
        },
        {
            $group: {
                _id: "$brand",
                products: { $push: "$$ROOT" },
                firstImage: { $first: { $arrayElemAt: ["$images", 0] } },
                productCount: { $sum: 1 },
            },
        },
        { $project: { _id: 0, brand: "$_id", firstImage: 1, productCount: 1 } },
    ])
    const product_type = await Product.aggregate([
        {
            $match: {
                $and: [
                    { stock_status: "Available" },
                    { is_Listed: true },
                    { "category.is_Listed": true },
                ],
            },
        },
        {
            $group: {
                _id: "$product_type",
                products: { $push: "$$ROOT" },
                firstImage: { $first: { $arrayElemAt: ["$images", 0] } },
                productCount: { $sum: 1 },
            },
        },
        {
            $project: {
                _id: 0,
                product_type: "$_id",
                firstImage: 1,
                productCount: 1,
            },
        },
    ])

    res.render("user/home", {
        layout: "layouts/userLayout",
        allProducts,
        brands,
        product_type,
    })
})

//GET
//@route /product/:id
const productDetails = asyncHandler(async (req, res) => {
    const randomProducts = await Product.aggregate([
        {
            $match: {
                $and: [
                    { stock_status: "Available" },
                    { is_Listed: true },
                    { "category.is_Listed": true },
                ],
            },
        },
        { $sample: { size: 8 } },
    ])
    const product = await Product.findOne({ _id: req.params.id })
    console.log(randomProducts)
    res.render("user/product-details", {
        layout: "layouts/userLayout",
        product,
        randomProducts,
    })
})

//GET
//@route /shop/
const shopPage = asyncHandler(async (req, res) => {
    //Sort
    var sort = req.query.sort || "stock_status"
    var order = req.query.order || 1

    const sortMethod = {}
    sortMethod[sort] = order
    //Filter
    const type = req.query.type
    const brand = req.query.brand
    const category = req.query.category
    const size = req.query.size
    var filter = [
        { stock_status: "Available" },
        { is_Listed: true },
        { "category.is_Listed": true },
    ]
    type && filter.push({ product_type: type })
    brand && filter.push({ brand: brand })
    category && filter.push({ "category.name": category })
    size && filter.push({ size: size })
    //Search
    const search = req.query.search
    search && filter.push({ title: { $regex: search, $options: "i" } })

    //PAGINATION
    const page = req.query.page * 1 || 1
    const limit = 9
    const skip = (page - 1) * limit
    const count = await Product.find({ $and: filter }).count()

    const allProducts = await Product.find({ $and: filter })
        .sort(sortMethod)
        .skip(skip)
        .limit(limit)
    const allCategories = await Category.find({})
    const brands = await Product.aggregate([
        {
            $match: {
                $and: [{ is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        {
            $group: {
                _id: "$brand",
                products: { $push: "$$ROOT" },
                productCount: { $sum: 1 },
            },
        },
        { $project: { _id: 0, brand: "$_id", productCount: 1 } },
    ]).sort({ brand: 1 })
    const product_type = await Product.aggregate([
        {
            $match: {
                $and: [{ is_Listed: true }, { "category.is_Listed": true }],
            },
        },
        {
            $group: {
                _id: "$product_type",
                products: { $push: "$$ROOT" },
                productCount: { $sum: 1 },
            },
        },
        { $project: { _id: 0, product_type: "$_id", productCount: 1 } },
    ]).sort({ product_type: 1 })
    res.render("user/shop", {
        layout: "layouts/userLayout",
        allProducts,
        allCategories,
        brands,
        product_type,
        count,
        page,
        limit,
        type,
        brand,
        category,
        size,
        sort,
        order,
        search,
    })
})

//GET
//@route /wishlist/
const wishlistPage = asyncHandler(async (req, res) => {
    const randomProducts = await Product.aggregate([
        {
            $match: {
                $and: [
                    { stock_status: "Available" },
                    { is_Listed: true },
                    { "category.is_Listed": true },
                ],
            },
        },
        { $sample: { size: 8 } },
    ])
    res.render("user/wishlist", {
        layout: "layouts/userLayout",
        randomProducts,
    })
})

//GET
//@route /contact/
const contactPage = asyncHandler(async (req, res) => {
    res.render("user/contact", {
        layout: "layouts/userLayout",
    })
})

//GET
//@route /about/
const aboutPage = asyncHandler(async (req, res) => {
    res.render("user/about", {
        layout: "layouts/userLayout",
    })
})

module.exports = {
    homePage,
    productDetails,
    shopPage,
    wishlistPage,
    aboutPage,
    contactPage,
}
