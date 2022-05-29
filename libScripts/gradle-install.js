/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const qs = require('qs');

const LIB_VERSION = '1.0.0';

const searchForLib = () => {
	const queryObj = {
		'maven.groupId': 'io.craigmiller160',
		'maven.artifactId': 'craig-build-gradle-tool',
		repository: 'maven-releases',
		sort: 'version',
		direction: 'desc',
		version: LIB_VERSION
	};
	return axios.get(`/search?${qs.stringify(queryObj)}`);
};

const getDownloadUrl = (result) =>
	result.items[0].assets.find((asset) => asset.downloadUrl.endsWith('jar'))
		.downloadUrl;

const handleError = (error) => {
	console.error('Error while installing gradle lib', error);
	process.exit(1);
};

searchForLib()
	.then(getDownloadUrl)
	.catch(handleError);
