const path = require('path');
const os = require('os');

const GRADLE_TOOL_VERSION = '1.0.3';
const CRAIG_BUILD_DIR = path.join(os.homedir(), '.craig-build');
const CRAIG_BUILD_GRADLE_DIR = path.join(CRAIG_BUILD_DIR, 'gradle');
const GRADLE_TOOL_FILE = path.join(
	CRAIG_BUILD_GRADLE_DIR,
	`craig-build-gradle-tool-${GRADLE_TOOL_VERSION}.jar`
);

module.exports = {
	GRADLE_TOOL_VERSION,
	CRAIG_BUILD_DIR,
	CRAIG_BUILD_GRADLE_DIR,
	GRADLE_TOOL_FILE
};
