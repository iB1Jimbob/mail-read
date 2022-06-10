const fs = require('fs');
module.exports = class JSONDatabase {
	fileName;
	constructor(options) {
		this.fileName = options?.fileName ?? "database.json";
		// Create database file if it doesn't exist
		if (!fs.existsSync(this.fileName)) {
			fs.writeFileSync(this.fileName, "{}");
		}
	}

	data() {
		return JSON.parse(fs.readFileSync(this.fileName, "utf8"));
	}

	get(key) {
		return this.data()[key];
	}

	set(key, value) {
		let data = this.data();
		data[key] = value;
		fs.writeFileSync(this.fileName, JSON.stringify(data));
	}

	delete(key) {
		let data = this.data();
		delete data[key];
		fs.writeFileSync(this.fileName, JSON.stringify(data));
	}

	clear() {
		fs.writeFileSync(this.fileName, "{}");
	}

	keys() {
		return Object.keys(this.data());
	}

	values() {
		return Object.values(this.data());
	}

	entries() {
		return Object.entries(this.data());
	}

	has(key) {
		return this.data().hasOwnProperty(key);
	}

	size() {
		return Object.keys(this.data()).length;
	}

	isEmpty() {
		return this.size() === 0;
	}

	toString() {
		return JSON.stringify(this.data());
	}
}