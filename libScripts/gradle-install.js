/* eslint-disable no-console */
const fs = require('fs');
const axios = require('axios');
const qs = require('qs');
const { getConstants } = require('./getConstants');
const { GRADLE_TOOL_VERSION, CRAIG_BUILD_GRADLE_DIR, GRADLE_TOOL_FILE } =
	getConstants();

const restApiInstance = axios.create({
	baseURL: 'https://nexus-craigmiller160.ddns.net/service/rest/v1'
});

const streamPromise = (stream) =>
	new Promise((resolve, reject) => {
		stream.on('finish', resolve);
		stream.on('error', reject);
	});

const prepareDirectory = () => {
	if (fs.existsSync(CRAIG_BUILD_GRADLE_DIR)) {
		fs.rmSync(CRAIG_BUILD_GRADLE_DIR, {
			force: true,
			recursive: true
		});
	}
	fs.mkdirSync(CRAIG_BUILD_GRADLE_DIR, {
		recursive: true
	});
};

const searchForGradleTool = () => {
	const isSnapshot = /^.*-SNAPSHOT$/.test(GRADLE_TOOL_VERSION);
	const repository = isSnapshot ? 'maven-snapshots' : 'maven-releases';
	const versionKey = isSnapshot ? 'maven.baseVersion' : 'version';
	const queryObj = {
		'maven.groupId': 'io.craigmiller160',
		'maven.artifactId': 'craig-build-gradle-tool',
		repository,
		sort: 'version',
		direction: 'desc',
		[versionKey]: GRADLE_TOOL_VERSION
	};
	const uri = `/search?${qs.stringify(queryObj)}`;
	console.log(`Searching for gradle tool: ${uri}`);
	return restApiInstance.get(uri);
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
			streamPromise(res.data.pipe(fs.createWriteStream(GRADLE_TOOL_FILE)))
		);

const handleError = (error) => {
	console.error('Error while installing gradle lib', error);
	process.exit(1);
};

prepareDirectory();
console.log('Downloading craig-build-gradle-tool');
searchForGradleTool()
	.then(getDownloadUrl)
	.then(downloadFile)
	.catch(handleError);
