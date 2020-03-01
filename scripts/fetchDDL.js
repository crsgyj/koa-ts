/**
 * 获取DDL
 */
const Sequelize = require('sequelize');
const fs = require('fs');
const { resolve } = require('path')
let db = ''
const fetchTbNamesSql = () => `SELECT table_name FROM information_schema.tables WHERE table_schema='${db}';`
const createSql = (tableName) => `SHOW CREATE table \`${db}\`.\`${tableName}\`;`;

async function main() {
  const config = require('../config/development.json').models.bsq;
  db = config.database;
  console.log(config)
  const ddlDir = resolve(__dirname, 'ddl/');
  if (!fs.existsSync(ddlDir)) {
    fs.mkdirSync(ddlDir)
  }
  
  const sequelize = new Sequelize.Sequelize({
    ...config,
    logging: (...args) => void console.log(`${args}`)
  });

  await sequelize.authenticate()
    .then(() => {
      console.log('连接成功')
    })
    .catch(() => {
      console.log('数据库连接失败')
      process.exit(1)
    })
  const tableNames = await sequelize.query(fetchTbNamesSql(config.database), { raw:true })
    .then(([tbs]) => tbs.map(e => e['table_name']))
  console.log(`tableNames: ${tableNames.join('; ')}`);
  
  const fetchOne = (tbname) =>  sequelize.query(createSql(tbname)).then(([resp]) => resp[0]['Create Table']);
  for (let i = 0, len = tableNames.length; i < len; i++) {
    const n = tableNames[i];
    const dir  = resolve(ddlDir, `${n}.sql`);
    if (fs.existsSync(dir)) {
      continue
    }
    const ddl = await fetchOne(n);
    
    fs.writeFileSync(dir, ddl);
    console.log('写入成功:', dir);
  }

  sequelize.close()
  // SHOW CREATE DATABASE ZOO\G;
}

main()