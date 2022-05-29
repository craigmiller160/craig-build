const path = require('path');
const fs = require('fs');

const getConstants = () => {
	const srcPath = path.join(__dirname, '..', 'src', 'installConstants.js');
	const buildPath = path.join(
		__dirname,
		'..',
		'build',
		'installConstants.js'
	);
	if (fs.existsSync(srcPath)) {
		return require(srcPath);
	}

	return require(buildPath);
};

module.exports = {
	getConstants
};
