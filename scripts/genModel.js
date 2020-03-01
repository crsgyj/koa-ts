/**
 * 批量生成model.ts文件，未拉取可用。
 */
const fs = require('fs');
const { resolve } = require('path');
const appRootPath = require('app-root-path');

const upcase1 = str => str[0].toUpperCase() + str.slice(1);

const template = (tablename, columDefines) => `
import { DataTypes, Op } from 'sequelize';
import { Table, Column, Model, PrimaryKey, Comment, Scopes, DefaultScope } from 'sequelize-typescript';
// import { likeScope, equalScope, hideScope } from '../utils';

@DefaultScope({

})
@Scopes(() => ({
  
}))
@Table({
  tableName: '${tablename}',
  modelName: '${tablename}',
  timestamps: true
}) 
export default class ${upcase1(tablename)}Model extends Model<${upcase1(tablename)}Model> {
${columDefines}
}
`;

const typeC = (type) => {
  switch (type) {
    case 'STRING':
    case 'CHAR':
    case 'TEXT':
      return 'string'
    case 'DATE':
      return 'Date'
    case 'INTEGER':
    case 'BIGINT':
    case 'TINYINT':
    case 'SMALLINT':
    case 'DOUBLE':
      return 'number'
    default:
      return 'string'
  }
}

const columnDefines = ({
  name,
  type,
  length,
  comment,
  isPrimary
}) => `  /** ${name} */\n${isPrimary ? '  @PrimaryKey\n  @AutoIncream\n' : ''}  @Comment('${comment}')\n  @Column(DataTypes.${type}${length ? `(${length})` : ''})\n  ${name}: ${typeC(type)}`;

async function main() {
  const ddlDir = resolve(__dirname, 'ddl/');
  const files = fs.readdirSync(ddlDir).filter(e => !e.startsWith('_') && e.endsWith('.sql'));
  if (!fs.existsSync(ddlDir)) {
    return
  }
 
  for (const f of files) {
    const tablename = f.replace('.sql', '')

    const destFile = resolve(appRootPath.path, `src/models/bsqModels/${tablename}.model.ts`);

    if (fs.existsSync(destFile)) {
      continue
    }
    let content = fs.readFileSync(resolve(ddlDir, f), { encoding: 'utf8' });
    const lines = content.split('\n').slice(1, -1);
    let primary = (lines.find(e => e.match("PRIMARY")) || '').trim().match(/`[^`]+`/g);
    primary = (primary ? primary[0] : '').replace(/`/g, '');
    const result = []
    for (const line of lines) {
      const data = analyze(line);
      if (data) {
        data.isPrimary = data.name === primary;
        result.push(columnDefines(data))
      }
    }
    if (result.length == 0) {
      console.log(content)
    }
    const temp = template(tablename, result.join('\n'))

    fs.writeFileSync(destFile, temp)
    console.log('写入完成。 ', destFile)
  }
}

function analyze(line) {
  if (!line.trim().startsWith('`')) {
    return null
  }
  const parts = line.replace(',', '').trim().split(' ');
  const name = parts[0].replace(/`/g, '');
  let [type, length] = parts[1].replace(/(\w+)(\(\d+\))?/, '$1,$2').replace(/[\(\)]/g, '').split(',');
  
  let comment = parts[parts.length - 2] === 'COMMENT' ? parts[parts.length - 1] : name;
  comment = comment.replace(/\'/g, '')
  switch (type) {
    case 'char':
      type = 'CHAR'; break
    case 'varchar':
      type = 'STRING'; break
    case 'int':
      type = 'INTEGER'; 
      length = length ? `{ length: ${length} }` : ''; break
    case 'tinyint':
      type = 'TINYINT'; 
      length = length ? `{ length: ${length} }` : ''; break
    case 'datetime':
    case 'timestamp':
    case 'date':
      type = 'DATE'; break
    case 'bigint':
      type = 'BIGINT'; 
      length = length ? `{ length: ${length} }` : ''; break
    case 'text':
      type = 'TEXT'; break
    case 'smallint':
      type = 'SMALLINT';
      length = length ? `{ length: ${length} }` : ''; break
    case 'double':
      type = 'DOUBLE'; break
    default:
      type.trim() && console.log('!!!!!!analyze. type:', line);
  }

  return {
    name,
    type,
    length,
    comment,
  }
}

main()



