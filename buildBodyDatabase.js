const fs = require('fs')
// const { Sequelize, DataTypes, Model, UniqueConstraintError, Op, QueryTypes } = require('sequelize');
const TABLES =  require('./database/table')

async function buildBodyDatabase(order_id){
    const OrderInfoTable = await TABLES.OrderInfo;

    const order = await OrderInfoTable.findOne({
        where : {
            order_id
        }
    })

    if(order) {
        // return order summary
        return order.summary
    } else {
        const summary = {refresh: "2023-01-01T01:01:01Z", detail: {id: order_id}}

        // Update a empty record in DB
        await OrderInfoTable.create({
            order_id,
            summary: summary
        })

        return summary
    }
}

// buildBodyDatabase(125);

module.exports = buildBodyDatabase