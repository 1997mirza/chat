const findInactiveUsers =(clients,activeUsers) =>{
    /* funkcija prima listu id-a od aktivnih konekcija i listu zabiljezeniih konekcija sa pripadajucim nickom,
    funckcija treba da pronadje neaktivne konekcije i napravi listu korisnika koji nisu aktivni
     */
    let newList =[];
    let fnialList =[];
    for (let i = 0; i < clients.length; i++) {
        let element = clients[i];
        for (let j = 0; j < activeUsers.length; j++) {
            if(element == activeUsers[j].id) {
               newList.push(activeUsers[j])   
            }else {  

            }
        }
    }
    for (let i = 0; i < activeUsers.length; i++) {
        let element = activeUsers[i];
        let counter = 0;
        for (let j = 0; j < newList.length; j++) {
            if (element.nick === newList[j].nick) {
                counter ++
            }
        }
        if(counter == 0) {
            if(fnialList.includes(element.nick)) {
                continue
            } else {
                fnialList.push(element.nick)
            }
        }
    }
    return fnialList
}
//funkcija updateuje lista aktivnih konekcija jer postoji mogucnost da je nekom pukla konekcija
const updateActiveList =(clients,activeUsers)=> {
    let newList =[];
    for (let i = 0; i < clients.length; i++) {
        let element = clients[i];
        for (let j = 0; j < activeUsers.length; j++) {
            if(element == activeUsers[j].id) {
               newList.push(activeUsers[j])   
            }else {  

            }
        }
    }
    return newList
}
/* funkcija provjerava da li je user vec prijavljen sa drugog taba i pregledniku,
da se nebi obavjestavali drugi korisnici ako je korisnik vec ima konekciju iz drugog taba*/
const isUserActive = (activeUsers,newUser) => {
    for (let i = 0; i < activeUsers.length; i++) {
        if(activeUsers[i].nick === newUser.nick) return true
    }
    return false
}
/* funkcija pravi listu aktivnih korisnika bez duplikata koja se emituje svim aktivnim korisnicima */
const makeOnlineList =(clients,activeUsers)=> {
    let newList = []
    for (let i = 0; i < clients.length; i++) {
        let element = clients[i];
        for (let j = 0; j < activeUsers.length; j++) {
            if(element == activeUsers[j].id) {
                if(newList.includes(activeUsers[j].nick)) {
                    continue
                } else {
                    newList.push(activeUsers[j].nick)
                }
            }
        }
    }
    return newList
}
module.exports = {findInactiveUsers,updateActiveList,isUserActive,makeOnlineList}