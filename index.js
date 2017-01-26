#!/usr/bin/env node
"use strict";

const AWS = require("./aws");
const co = require("co");
const clone = require("lodash.cloneDeep");
const pkg = require("./package.json");
const program = require("commander");

if (process.argv.length < 3) {
  process.argv.push("--help");
}

program.version(pkg.version).parse(process.argv);

if(program.args.length !== 1) {
  console.error("table name is undefined");
  return;
}

co(get(program.args[0])).catch(e => console.error(e.message));

function *get(tableName) {
  const DynamoDB = new AWS.DynamoDB();

  const r = yield DynamoDB.describeTable({
    TableName: tableName,
  }).promise();
  const Table = r.Table;

  const result = shaping(Table);
  console.log(JSON.stringify(result, null, 2));
}

function shaping(table) {
  let result = clone(table);

  if(result.GlobalSecondaryIndexes && result.GlobalSecondaryIndexes.length >= 1) {
    result.GlobalSecondaryIndexes = result.GlobalSecondaryIndexes.map(e => {
      delete e.IndexArn;
      delete e.ItemCount;
      delete e.IndexStatus;
      delete e.IndexSizeBytes;
      delete e.ProvisionedThroughput.NumberOfDecreasesToday;
      delete e.ProvisionedThroughput.LastIncreaseDateTime;
      delete e.ProvisionedThroughput.LastDecreaseDateTime;
      return e;
    });
  }

  if(result.LocalSecondaryIndexes && result.LocalSecondaryIndexes.length >= 1) {
    result.LocalSecondaryIndexes = result.LocalSecondaryIndexes.map(e => {
      delete e.IndexArn;
      delete e.IndexStatus;
      delete e.ItemCount;
      delete e.IndexSizeBytes;
      delete e.ProvisionedThroughput.NumberOfDecreasesToday;
      delete e.ProvisionedThroughput.LastIncreaseDateTime;
      delete e.ProvisionedThroughput.LastDecreaseDateTime;
      return e;
    });
  }
  delete result.ProvisionedThroughput.NumberOfDecreasesToday;
  delete result.ProvisionedThroughput.LastIncreaseDateTime;
  delete result.ProvisionedThroughput.LastDecreaseDateTime;
  delete result.TableArn;
  delete result.TableName;
  delete result.TableSizeBytes;
  delete result.TableStatus;
  delete result.ItemCount;
  delete result.CreationDateTime;
  return result;
}
