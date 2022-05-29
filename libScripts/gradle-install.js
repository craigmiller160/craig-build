/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const qs = require('qs');
const os = require('os');

const LIB_VERSION = '1.0.0';

const restApiInstance = axios.create({
	baseURL: 'https://craigmiller160.ddns.net:30003/service/rest/v1'
});
// TODO need these to be constants accessible to this script and other code
const targetDirectory = path.join(os.homedir(), '.craig-build', 'gradle');
const targetFile = path.join(
	targetDirectory,
	`craig-build-gradle-tool-${LIB_VERSION}.jar`
);

const streamPromise = (stream) =>
	new Promise((resolve, reject) => {
		stream.on('finish', resolve);
		stream.on('error', reject);
	});

const prepareDirectory = () => {
	if (fs.existsSync(targetDirectory)) {
		fs.rmSync(targetDirectory, {
			force: true,
			recursive: true
		});
	}
	fs.mkdirSync(targetDirectory, {
		recursive: true
	});
};

const searchForLib = () => {
	const queryObj = {
		'maven.groupId': 'io.craigmiller160',
		'maven.artifactId': 'craig-build-gradle-tool',
		repository: 'maven-releases',
		sort: 'version',
		direction: 'desc',
		version: LIB_VERSION
	};
	return restApiInstance.get(`/search?${qs.stringify(queryObj)}`);
};

const getDownloadUrl = (result) =>
	result.data.items[0].assets.find((asset) =>
		asset.downloadUrl.endsWith('jar')
	).downloadUrl;

const downloadFile = (downloadUrl) =>
	axios
		.get(downloadUrl, {
			responseType: 'stream'
		})
		.then((res) =>
			streamPromise(res.data.pipe(fs.createWriteStream(targetFile)))
		);

const handleError = (error) => {
	console.error('Error while installing gradle lib', error);
	process.exit(1);
};

prepareDirectory();
searchForLib().then(getDownloadUrl).then(downloadFile).catch(handleError);
