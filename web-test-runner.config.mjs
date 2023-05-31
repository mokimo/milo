import { importMapsPlugin } from '@web/dev-server-import-maps';
import { defaultReporter } from '@web/test-runner';

function customReporter() {
  return {
    async reportTestFileResults({ logger, sessionsForTestFile }) {
      sessionsForTestFile.forEach((session) => {
        session.testResults.tests.forEach((test) => {
          if (!test.passed && !test.skipped) {
            logger.log(test);
          }
        });
      });
    },
  };
}
export default {
  coverageConfig: {
    include: [
      '**/libs/**',
      '**/tools/**',
      '**/build/**',
    ],
    exclude: [
      '**/mocks/**',
      '**/node_modules/**',
      '**/test/**',
      '**/deps/**',
      '**/imslib/imslib.min.js',
      // TODO: folders below need to have tests written for 100% coverage
      '**/ui/controls/**',
      '**/blocks/library-config/**',
      '**/hooks/**',
      '**/special/tacocat/**',
    ],
  },
  plugins: [importMapsPlugin({})],
  reporters: [
    defaultReporter({ reportTestResults: true, reportTestProgress: true }),
    customReporter(),
  ],
  testRunnerHtml: (testFramework) => `
    <html>
      <script type="importmap">
      {
        "imports": {
          "/libs/utils/utils.js": "/test/config/utils.js",
          "/utils/utils.js": "/test/config/utils.js"
        },
        "scopes": {
          "/test/blocks/caas/": {
            "/libs/utils/utils.js": "/test/blocks/caas/mocks/utils.js"
          },
          "/libs/blocks/caas/": {
            "/libs/utils/utils.js": "/test/blocks/caas/mocks/utils.js"
          },
          "/test/config/": {
            "/libs/utils/utils.js": "/libs/utils/utils.js"
          }
        }
      }
      </script>
      <head>
        <script type="module">
          const oldFetch = window.fetch;
          window.fetch = async (resource, options) => {
            if (!resource.startsWith("/") && !resource.startsWith('http://localhost')) {
              console.error(
                '** External resource fetch is disallowed in unit tests, please find a way to mock!',
                resource
              );
            }
            return oldFetch.call(window, resource, options);
          };
          const oldXHROpen = XMLHttpRequest.prototype.open;
          XMLHttpRequest.prototype.open = async function (...args) {
            let [method, url, asyn] = args;
            if (!resource.startsWith("/") && url.startsWith('http://localhost')) {
              console.error(
                '** XMLHttpRequest request is disallowed in unit tests, please find a way to mock!',
                url
              );
            }
            return oldXHROpen.apply(this, args);
          };
        </script>
      </head>
      <body>
        <script type="module" src="${testFramework}"></script>
      </body>
    </html>`,
  files: ['**/global-navigation.test.js'],
};
