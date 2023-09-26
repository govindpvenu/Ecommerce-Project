const asyncHandler = require('express-async-handler')
const Order = require('../../models/Order')



//GET
//@route /orders/
const orders = asyncHandler(async (req, res) => {
    const orders = await Order.find();
    const allOrders = await Order.find({}).populate('products.productId')
    res.render('admin/orders',{layout: "layouts/adminLayout",orders,allOrders})
})

// cancel order

const adminCancelOrder = async (req,res)=>{
    try {
        const id = req.params.id;
        const update = {
            orderStatus : 'CANCELLED'
        }
        const order = await Order.findByIdAndUpdate(id,update);

        res.redirect('/admin/orders')
    } catch (error) {
        console.log(error.message);
    }
}


const changeStatus = async (req,res)=>{
    try {
        const id = req.params.id;
        console.log(id);
        const order = await Order.findOne({_id:id});
        console.log('current status:'+order.orderStatus);
        switch (order.orderStatus) {
            case 'SUCCESS':
                console.log('success');
                 update = {orderStatus : 'CANCELLED'}
                break;

            case 'PENDING':
                console.log('pending');
                 update = {orderStatus : 'SUCCESS'}
            break;

            case 'CANCELLED':
                console.log('cancelled');
                 update = {orderStatus : 'PENDING'}
            break;
            default:
                console.log('default');
            break;
        }
        const orderUpdate = await Order.findByIdAndUpdate(id,update);
        res.redirect('/admin/orders')
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    orders,
    adminCancelOrder,
    changeStatus

}