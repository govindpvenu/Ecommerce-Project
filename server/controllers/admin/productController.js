const asyncHandler = require("express-async-handler")
const Product = require("../../models/Product")
const Category = require("../../models/Category")

//GET
//@route /admin/products
const products = asyncHandler(async (req, res) => {
    //SORT
    var sort = req.query.sort || "createdAt"
    var order = req.query.order || 1
    const sortMethod = {}
    sortMethod[sort] = order

    //Search
    const search = req.query.search
    var filter = [{ is_Listed: true }, { "category.is_Listed": true }]
    search && filter.push({ title: { $regex: search, $options: "i" } })

    //PAGINATION
    const page = req.query.page * 1 || 1
    const limit = req.query.limit * 1 || 7
    const skip = (page - 1) * limit
    const count = await Product.find({
        $and: filter,
    }).count()

    const allProducts = await Product.find({
        $and: filter,
    })
        .sort(sortMethod)
        .skip(skip)
        .limit(limit)

    const messages = await req.consumeFlash("info")
    res.render("admin/products", {
        layout: "layouts/adminLayout",
        title: "Products",
        messages,
        allProducts,
        count,
        page,
        sort,
        order,
    })
})

//GET
//@route /admin/products/add-product
const addProduct = asyncHandler(async (req, res) => {
    const allCategories = await Category.find({})
    res.render("admin/add-product", {
        layout: "layouts/adminLayout",
        title: "Product Management",
        allCategories,
    })
})

//POST
//@route /admin/product/post-product
const postProduct = asyncHandler(async (req, res) => {
    const { title, description, brand, price, category, regular_price, sales_price, quantity, size, product_type, stock_status } = req.body
    const category_id = await Category.findOne({ name: category }, {})
    // const fileNames = req.files.map(file => file.filename);
    const fileNames = req.body.images

    const product = await Product.create({
        title,
        description,
        brand,
        price,
        regular_price,
        sales_price,
        quantity,
        size,
        product_type,
        stock_status,
        category: category_id,
        images: fileNames,
    })
    await req.flash("info", "Product added successfully")
    res.redirect("/admin/products")
})

//GET
//@route /admin/product/edit/:id
const editProduct = asyncHandler(async (req, res) => {
    let product_id = req.params.id
    let product = await Product.findOne({ _id: product_id })
    const allCategories = await Category.find({})
    res.render("admin/edit-product", {
        layout: "layouts/adminLayout",
        title: "Product Management",
        product,
        allCategories,
    })
})

//post
//@route /admin/product/edit/:id
const updateProduct = asyncHandler(async (req, res) => {
    let product_id = req.params.id
    const { title, description, brand, category, regular_price, sales_price, quantity, product_type, size, stock_status } = req.body
    const category_id = await Category.findOne({ name: category }, {})
    const fileNames = req.body.images
    if (req.body.imageImport) {
        var imgImp = req.body.imageImport.split(",")
    } else {
        var imgImp = []
    }
    const imgArr = [...fileNames, ...imgImp]
    if (req.files.length) {
        const product = await Product.findByIdAndUpdate(
            { _id: product_id },
            {
                title,
                description,
                brand,
                regular_price,
                sales_price,
                quantity,
                category: category_id,
                product_type,
                size,
                stock_status,
                images: imgArr,
            }
        )
    } else {
        const product = await Product.findByIdAndUpdate(
            { _id: product_id },
            {
                title,
                description,
                brand,
                regular_price,
                sales_price,
                quantity,
                category: category_id,
                product_type,
                size,
                stock_status,
            }
        )
    }
    await req.flash("info", "Product edited successfully")
    res.redirect("/admin/products")
})

//GET
//@route /admin/product/delete/:id
const deleteProduct = asyncHandler(async (req, res) => {
    let product_id = req.params.id
    let product = await Product.findByIdAndUpdate({ _id: product_id }, { is_Listed: false })
    await req.flash("info", "Product has been deleted")
    res.redirect("/admin/products")
})

//GET
//@route /admin/delete-image/:id/:img
const deleteImage = async (req, res) => {
    const id = req.params.id
    const img = req.params.img

    try {
        const updatedDocument = await Product.findOneAndUpdate({ _id: id }, { $pull: { images: img } })

        if (!updatedDocument) {
            return res.status(404).json({ message: "Document not found" })
        }
        res.redirect("/admin/products/edit/" + id)
    } catch (err) {
        console.error(err)
        res.status(500).json({
            message: "An error occurred while deleting the element",
        })
    }
}

module.exports = {
    products,
    addProduct,
    postProduct,
    editProduct,
    updateProduct,
    deleteProduct,
    deleteImage,
}
