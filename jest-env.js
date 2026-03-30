/**
 * Custom Jest environment for Node
 * Bypasses localStorage security error
 */

const NodeEnvironment = require('jest-environment-node').default;

class CustomNodeEnvironment extends NodeEnvironment {
  async setup() {
    // Skip setup if it causes issues
    try {
      await super.setup();
    } catch (error) {
      if (!error.message.includes('localStorage')) {
        throw error;
      }
      // Ignore localStorage errors
    }
  }
}

module.exports = CustomNodeEnvironment;
