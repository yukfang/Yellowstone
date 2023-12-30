const proxying = require('../http/proxying');
const cookieRemote = require('./cookie');

let cookie = {
    value : '',
    fetchTime : 0
}

function setValueByLabel(form, label, newValue) {
    let items = form.order_data.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].label === label) {
        switch(label) {
            case "Ticket Title":    
            case "Advertiser / Client Name":
            case "Ad Account ID(s)":
            case "Please list name & role of Account Team for this client (BPM/CSM/ADE etc.)":
            case "Pixel ID":
            case "Website URL(s)":
            case "Target Implementation Date":
            case "Reason for request: Please briefly describe the help needed for this account.":
                items[i].content[0].input_content = newValue;
                break;
            case "Client Vertical ":
                items[i].content[0].option_key = "Gaming";
                items[i].content[0].option_value = "Gaming";
                break;
            default:
                console.log(`Unknow Lable found: ${label}`)
                break;
        } 

        form.items = items
      }
    }
    return form;
}

async function athena_api_v2_order_submit(){
    const endpoint = `https://ads.tiktok.com/athena/api/v2/order/submit`;
    const method      = 'POST';

    if(Date.now() - cookie.fetchTime > 1000 * 60 * 3) {
        cookie = {
            value: (await cookieRemote()),
            fetchTime: Date.now()
        }
    }
    // console.log(`cookie = ${JSON.stringify(cookie)}`)
    let header      = {Cookie: cookie.value}
    let param        = null;

    let form = require('./form')
    form = setValueByLabel(form, "Ticket Title",              "This is a test case")
    form = setValueByLabel(form, "Advertiser / Client Name",  "Name X")
    form = setValueByLabel(form, "Client Vertical ",          "Gaming")
    form = setValueByLabel(form, "Ad Account ID(s)",          "7311880807508099074")
    form = setValueByLabel(form, "Please list name & role of Account Team for this client (BPM/CSM/ADE etc.)", "XYZ")
    form = setValueByLabel(form, "Pixel ID",    "CM6GND3C77U43IB7P51G")
    form = setValueByLabel(form, "Website URL(s)",    "https://test.vip/")
    form = setValueByLabel(form, "Target Implementation Date",    "2023-12-29")
    form = setValueByLabel(form, "Reason for request: Please briefly describe the help needed for this account.",    
                    "need guidance in complete payment event")

    let body        = form;

    const response = (await proxying(method, endpoint, header, param, body, true));
   //  console.log(response.data)

    if(response.status == 200 ) {
        const raw_data = JSON.parse(response.data)
        console.log(raw_data)
         // const data = {data: raw_data.data.filter(d => d.order_id === '1448935')}
        //  const data = raw_data
      //   console.log(data.data[0])
        // console.log(data.data.length)

        return raw_data;
    } else {
        console.log(`Get Order list Error !!!`)
        return null;
    }
}


athena_api_v2_order_submit()

module.exports = athena_api_v2_order_submit


