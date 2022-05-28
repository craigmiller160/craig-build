const fs = require('fs');
const path = require('path');
const axios = require('axios');
const qs = require('qs');

const getNexusSearchUri = () => {
	const queryObj = {
		'maven.groupId': 'io.craigmiller160',
		'maven.artifactId': 'craig-build-gradle-tool',
		repository: 'maven-releases',
		sort: 'version',
		direction: 'desc'
	};
	return `/search?${qs.stringify(queryObj)}`;
};
