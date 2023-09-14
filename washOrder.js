const refreshTicket = require('./buildBodyRemote')

const tickets = [
    1468027
]

async function washOrders() {
    for(let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i]
        await refreshTicket(ticket)
    }
}

washOrders();