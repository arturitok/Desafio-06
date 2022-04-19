const fs = require('fs/promises');
const path = require('path');

class Mensajes {
	constructor(filename) {
		this.filename = filename;
	}

	async createFileIfNoneExist() {
		let file;
		try {
			// Leo si el archivo existe
			file = await fs.readFile(this.filename, 'utf-8');
			// Si existe, lo devuelvo
			return JSON.parse(file);
		} catch (error) {
			// Si hay algun error, verifico que sea porque el archivo no existe y creo uno con un array vacio
			if (error.code == 'ENOENT') {
				await fs.writeFile(this.filename, '[]');
				// Luego de crearlo, leo su valor para que la funcion devuelva un valor al ser llamada
				file = await fs.readFile(this.filename, 'utf-8');
			} else {
				// Si el error es por otra cosa, lo muestro por consola
				console.log(error);
			}
		}

		return JSON.parse(file);
	}

	async save(newData) {
		let file = await this.createFileIfNoneExist();
		// console.log(file);
		if (Array.isArray(newData)) {
			try {
				const data = JSON.parse(file);

				let currentId = 1;

				newData.forEach(item => {
					if (data.length > 0) {
						item.id = data.at(-1).id + 1;
					} else {
						item.id = currentId;
						currentId++;
					}
					data.push(item);
				});

				// console.log(data);

				await fs.writeFile(path.join(__dirname, this.filename), JSON.stringify(data, null, 2));
			} catch (err) {
				console.log(err);
			}
		} else {
			try {
				const data = await this.createFileIfNoneExist();

				newData.id = data.length > 0 ? data[data.length - 1].id + 1 : 1;

				data.push(newData);

				await fs.writeFile(path.join(__dirname, this.filename), JSON.stringify(data, null, 2));
			} catch (err) {
				console.log(err);
			}
		}
	}

	async getById(id) {
		try {
			const data = await this.createFileIfNoneExist();

			const match = data.filter((item, index) => item.id === id);
			if (match.length) {
				return match;
			}

			return 'Item not found';
		} catch (err) {
			console.log(err);
		}
	}

	async getAll() {
		try {
			const data = await this.createFileIfNoneExist();

			return data;
		} catch (err) {
			console.log(err);
		}
	}

	async deleteById(id) {
		try {
			const data = await this.createFileIfNoneExist();

			const newData = data.filter((item, index) => item.id !== id);

			// console.log(newData);

			await fs.writeFile(path.join(__dirname, this.filename), JSON.stringify(newData, null, 2));
		} catch (err) {
			console.log(err);
		}
	}

	async deleteAll() {
		try {
			await fs.writeFile(path.join(__dirname, this.filename), '[]');
		} catch (err) {
			console.log(err);
		}
	}
}

module.exports = Mensajes;