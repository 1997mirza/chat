/* Set the width of the side navigation to 250px */
function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.querySelector('.trigger-text').style.display = "none";
  }
  
  /* Set the width of the side navigation to 0 */
  function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.querySelector('.trigger-text').style.display = "block";

  }
  function getNick() {
		if (localStorage.getItem("nick") === null) {
			generateNick();
		} else {
			document.querySelector('#nik').innerHTML = localStorage.getItem("nick")
		}
	}
	function generateNick() {
		const nick = [];
		const suglasnici='bcdfghjklmnpqrstvwxyz';
		const samoglasnici='aeiou';
		const brojevi='0123456789';
		for (let i = 0; i < 6; i++) {
			if (i==0 || i==2){
				nick.push(suglasnici.charAt(Math.floor(Math.random() * 
 				suglasnici.length)));
			} else if (i==1 || i==3) {
				nick.push(samoglasnici.charAt(Math.floor(Math.random() * 
 				samoglasnici.length)));
			} else {
				nick.push(brojevi.charAt(Math.floor(Math.random() * 
 				brojevi.length)));
			}
		}
		document.querySelector('#nik').innerHTML = nick.join('');
		localStorage.setItem('nick', nick.join(''));

	}
	function showChat() {
		document.querySelector('#pocetna').style.display="none";
		document.querySelector('#chat').style.display="block";

	}
    const socket = io();

    socket.on('pozdrav',pozdrav => {
        console.log('pozdrav')
    })