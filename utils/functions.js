const  removeDuplicates = function (array) {
    let newArray = []
    for (let i = 0; i < array.length; i++) {
        newArray.push(array[i].nick)
    }
    let uniqueArray = newArray.filter((value,index) => newArray.indexOf(value) === index)
    return uniqueArray
}
const  removeUserFromList = function(array,object) {
    let newArray = [];
    newArray = array.filter(el => {
        return el.id != object.id
    })
    return newArray
}
const connectionsCounter = function (array,user) { 
    let counter = 0;
    for (let i = 0; i < array.length; i++) {
        if(array[i].nick === user.nick) counter++
    }
    return counter;
}

const findUserToOut = function (array,socket) {
    for (let i = 0; i < array.length; i++) {
        if ( socket === array[i].id) return array[i]
    }
}


    
module.exports = {removeDuplicates,removeUserFromList,connectionsCounter,findUserToOut}