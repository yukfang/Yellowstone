const refreshTicket = require('./buildBodyRemote')

const tickets = [
    1388441
]

async function washOrders() {
    for(let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i]
        const summary = await refreshTicket(ticket)
        console.log(summary)
    }
}

// washOrders();