const ChaosCore = require('../lib/chaos-core');
const config = require('../config.js');
const dummyPlugin = require('./dummy-plugin');

const chaos = new ChaosCore(config);
chaos.addPlugin(dummyPlugin);
chaos.listen();
