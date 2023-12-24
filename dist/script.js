if (localStorage.getItem('globalEncryptionKey') === null) {
	localStorage.setItem(
		'globalEncryptionKey',
		CryptoJS.lib.WordArray.random(128 / 8).toString(CryptoJS.enc.Hex),
	);
}

function generateNoteKey(code, passphrase) {
	return CryptoJS.SHA256(
		code + passphrase + localStorage.getItem('globalEncryptionKey'),
	).toString(CryptoJS.enc.Hex);
}

function encryptAndSend() {
	const code = document.getElementById('input_code').value;
	const passphrase = document.getElementById('input_pp').value;
	const key = generateNoteKey(code, passphrase);

	fetch('/secureapi/store', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			encryptedKey: key,
		}),
	})
		.then((response) => response.json())
		.then((data) => console.log(data))
		.catch((error) => console.error('Error:', error));
}

function retrieveAndDecrypt() {
	const code = document.getElementById('input_code').value;
	const passphrase = document.getElementById('input_pp').value;
	const lookupKey = generateNoteKey(code, passphrase);

	fetch('/secureapi/lookup', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			encryptedKey: lookupKey,
		}),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.status === 200) {
				const encryptedData = data.data;
				const decryptedData = CryptoJS.AES.decrypt(
					encryptedData,
					lookupKey,
				).toString(CryptoJS.enc.Utf8);
				showEditor(decryptedData);
			} else {
				alert(JSON.stringify(data));
			}
		})
		.catch((error) => console.error('Error:', error));
}

function showEditor(data) {
	document.getElementById('noEditor').style.display = 'none';
	document.getElementById('editorDiv').style.display = 'block';
	document.getElementById('editor').value = data;
}

function save() {
	const code = document.getElementById('input_code').value;
	const passphrase = document.getElementById('input_pp').value;
	const lookupKey = generateKey(code, passphrase);

	const encryptedData = CryptoJS.AES.encrypt(
		document.getElementById('editor').value,
		lookupKey,
	).toString();

	fetch('/secureapi/save', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			encryptedKey: lookupKey,
			encryptedData: encryptedData,
		}),
	})
		.then((response) => response.json())
		.then((data) => console.log(data))
		.catch((error) => console.error('Error:', error));
}
