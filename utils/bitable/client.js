const lark = require("@larksuiteoapi/node-sdk");

const client = new lark.Client({
  appId: "cli_a080c84f3272d013",
  appSecret: "j7VNgXmVpsGbkS52xlt0VhxZ575bkSpX",
  appType: lark.AppType.SelfBuild,
  domain: lark.Domain.Feishu,
});

module.exports = client;
