// check weekend
const isWeekend = (date) => {
    const day = date.getDate()
    return day === 0 || day === 6
}


// start of the day
const startDay = (date) =>{
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return start
}


// end of the day
const endDay = (date) => {
    const end = new Date()
    end.setHours(23, 59, 99, 999)
    return end
}