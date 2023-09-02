// function getDbCfg(){
//     let dbConfig = {
//         "host"      : process.env.DB_HOST,
//         "username"  : process.env.DB_USER,
//         "password"  : process.env.DB_PWD,
//         "database"  : process.env.DB_NAME,
//         "dialect"   : "mysql"
//     }
//     console.log(`123`)
//     if(dbConfig.host === null) {
//         console.log(`Read DB From Local`)
//         dbConfig = require('./db_conn_local')
//     }

//     return dbConfig
// }

 
// module.exports =  getDbCfg()
console.log(`Process ENV PLATFORM ${process.env.PLATFORM}`)
module.exports = 
(process.env.PLATFORM === 'Azure')?
{
        "host"      : process.env.DB_HOST,
        "username"  : process.env.DB_USER,
        "password"  : process.env.DB_PWD,
        "database"  : process.env.DB_NAME,
        "dialect"   : "mysql"
}: require('./db_conn_local')