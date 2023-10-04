var axios = require('axios');



var data = JSON.stringify({
  "records": [
    {
      "fields": {
        "Athena": 1528384
      }
    },
    {
      "fields": {
        "Athena": 1547928
      }
    }
  ]
});

var config = {
  method: 'POST',
  url: 'https://fsopen.bytedance.net/open-apis/bitable/v1/apps/WsTCb1IadapZ88s80CCc7kQnnsf/tables/tblySyt2mkBp7aA9/records/batch_create',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer u-d2saIq1CRas9vAxIwiaXo445nQsxk0rxMq001hOw0IrA'
  },
  data : data
};

axios(config)
.then(function (response) {
  console.log(JSON.stringify(response.data));
})
.catch(function (error) {
  console.log(error);
});