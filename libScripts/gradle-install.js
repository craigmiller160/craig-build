/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const qs = require('qs');

const LIB_VERSION = '1.0.0';

const restApiInstance = axios.create({
	baseURL: 'https://craigmiller160.ddns.net:30003/service/rest/v1'
});

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

const handleError = (error) => {
	console.error('Error while installing gradle lib', error);
	process.exit(1);
};

searchForLib().then(getDownloadUrl).catch(handleError);
