const { Sequelize, DataTypes, Model, UniqueConstraintError, Op, QueryTypes } = require('sequelize');
const dbConfig   = require('./db_conn.js');
const detail = require('../utils/athena/detail.js');


console.log(`DbConfig:`)
console.log(`${dbConfig.host}_${dbConfig.username}_${dbConfig.database}`)

const sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, {
    host      : dbConfig.host,
    dialect   : dbConfig.dialect, /* one of 'mysql' | 'mariadb' | 'postgres' | 'mssql' */
    logging   : false
});

const hotOrder = {
    name     : "hot_order",
    option   : { force: false },
    property : {
        order_id            : { type: DataTypes.INTEGER,                            primaryKey: false,   allowNull : false  },
    }
}

const orderInfo2 = {
    name     : "order_info2",
    option   : { force: false },
    property : {
        order_id            : { type: DataTypes.INTEGER,                            primaryKey: true,   allowNull : false  },
        refreshAt           : { type: DataTypes.DATE,                               primaryKey: false,  allowNull : true   },
        update_time         : { type: DataTypes.DATE,                               primaryKey: false,  allowNull : true   },
        summary             : { type: DataTypes.JSON,                               primaryKey: false,  allowNull : false  },
        detail              : { type: DataTypes.JSON,                               primaryKey: false,  allowNull : true   },
        tag                 : { type: DataTypes.JSON,                               primaryKey: false,  allowNull : true   },
    }
}

async function createModel(m, force = false) {
    let name        = m.name;
    let property    = m.property;
    let option      = m.option;
    option.force = force;

    // console.log('create Model, property = ' + JSON.stringify(property));

    const model = sequelize.define(name, property, {freezeTableName: true});

    await model.sync(option);
    return model;
}

async function addTable(){
    if(true)
    {
        const order_id = 124;
        const data = {
            order_id,
            summary: {id: 123, name: "123"},
            detail: {id: order_id}
        }

        let mod = await createModel(orderInfo);

 

        await mod.findOne({where:{order_id}}).then(rec=>{
            if(rec) {
                return rec.update(data)
            } else {
                return mod.create(data)
            }
        })
    }
}

async function selectTable() {
    {
        let mod = await createModel(modelBuoyConfig);
        const configs = await mod.findAll();

        console.table(configs.map(c => c.dataValues))
        console.log(`---`)
    }
}

async function deleteTable() {
    if(false)
    {
        let mod = await createModel(modelBuoyConfig, true);
        // await mod.destroy({
        //     where : {
        //         buoyId : {
        //             [Op.not]: ''
        //         }
        //     }
        // })
    }
    if(false)
    {
        let mod = await createModel(modelBuoyCmd, true);
    }
    if(true)
    {
        let mod = await createModel(modelBuoyRecord, true);
    }
}


async function test() {
    await createModel(orderInfo, true)
    // await deleteTable();
    await addTable();
    // await selectTable();
}

// test();



module.exports =  {
    hotOrder : createModel(hotOrder),
    OrderInfo2 : createModel(orderInfo2),

 

    _ : 0
}
