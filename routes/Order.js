const express = require('express');
const { createOrder, fetchOrderByUser, deleteOrder, updateOrder } = require('../controller/Order');
const router = express.Router();

router.post('/',createOrder)
    .get('/',fetchOrderByUser)
    .delete('/:id',deleteOrder)
    .patch('/:id',updateOrder);

exports.router = router;