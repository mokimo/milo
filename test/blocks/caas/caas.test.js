import { expect } from '@esm-bundle/chai';
import { stub } from 'sinon';
import init from '../../../libs/blocks/caas/caas.js';
import { loadScript, loadStyle } from '../../../libs/utils/utils.js';
import { delay, waitForElement } from '../../helpers/waitfor.js';

let caasEl;

class ConsonantCardCollection {
  constructor(cfg, el) {
    caasEl = el;
  }
}

window.ConsonantCardCollection = ConsonantCardCollection;

describe('loadStrings', () => {
  const ogFetch = window.fetch;

  beforeEach(() => {
    document.body.innerHTML = `
      <main>
        <div>
          <p>Caas Demo</p>
          <p>
            <a
              id="caaslink"
              href="https://milo.adobe.com/tools/caas#eyJhZGRpdGlvbmFsUmVxdWVzdFBhcmFtcyI6W10sImFuYWx5dGljc0NvbGxlY3Rpb25OYW1lIjoiIiwiYW5hbHl0aWNzVHJhY2tJbXByZXNzaW9uIjpmYWxzZSwiYW5kTG9naWNUYWdzIjpbXSwiYm9va21hcmtJY29uU2VsZWN0IjoiIiwiYm9va21hcmtJY29uVW5zZWxlY3QiOiIiLCJjYXJkU3R5bGUiOiJoYWxmLWhlaWdodCIsImNhcmRUaXRsZUFjY2Vzc2liaWxpdHlMZXZlbCI6NiwiY29sbGVjdGlvbkJ0blN0eWxlIjoicHJpbWFyeSIsImNvbGxlY3Rpb25OYW1lIjoiIiwiY29sbGVjdGlvblNpemUiOiIiLCJjb250YWluZXIiOiIxMjAwTWF4V2lkdGgiLCJjb250ZW50VHlwZVRhZ3MiOltdLCJjb3VudHJ5IjoiY2Fhczpjb3VudHJ5L3VzIiwiY3VzdG9tQ2FyZCI6WyJjYXJkIiwiIl0sImN0YUFjdGlvbiI6Il9ibGFuayIsImRvTm90TGF6eUxvYWQiOmZhbHNlLCJkaXNhYmxlQmFubmVycyI6ZmFsc2UsImRyYWZ0RGIiOmZhbHNlLCJlbmRwb2ludCI6Ind3dy5hZG9iZS5jb20vY2hpbWVyYS1hcGkvY29sbGVjdGlvbiIsImVudmlyb25tZW50IjoiIiwiZXhjbHVkZWRDYXJkcyI6W10sImV4Y2x1ZGVUYWdzIjpbXSwiZmFsbGJhY2tFbmRwb2ludCI6IiIsImZlYXR1cmVkQ2FyZHMiOltdLCJmaWx0ZXJFdmVudCI6IiIsImZpbHRlckxvY2F0aW9uIjoibGVmdCIsImZpbHRlckxvZ2ljIjoib3IiLCJmaWx0ZXJzIjpbXSwiZmlsdGVyc1Nob3dFbXB0eSI6ZmFsc2UsImd1dHRlciI6IjR4IiwiaW5jbHVkZVRhZ3MiOltdLCJsYW5ndWFnZSI6ImNhYXM6bGFuZ3VhZ2UvZW4iLCJsYXlvdXRUeXBlIjoiNHVwIiwibG9hZE1vcmVCdG5TdHlsZSI6InByaW1hcnkiLCJvbmx5U2hvd0Jvb2ttYXJrZWRDYXJkcyI6ZmFsc2UsIm9yTG9naWNUYWdzIjpbXSwicGFnaW5hdGlvbkFuaW1hdGlvblN0eWxlIjoicGFnZWQiLCJwYWdpbmF0aW9uRW5hYmxlZCI6ZmFsc2UsInBhZ2luYXRpb25RdWFudGl0eVNob3duIjpmYWxzZSwicGFnaW5hdGlvblR5cGUiOiJub25lIiwicGFnaW5hdGlvblVzZVRoZW1lMyI6ZmFsc2UsInBsYWNlaG9sZGVyVXJsIjoiIiwicmVzdWx0c1BlclBhZ2UiOjUsInNlYXJjaEZpZWxkcyI6W10sInNldENhcmRCb3JkZXJzIjpmYWxzZSwic2hvd0Jvb2ttYXJrc0ZpbHRlciI6ZmFsc2UsInNob3dCb29rbWFya3NPbkNhcmRzIjpmYWxzZSwic2hvd0ZpbHRlcnMiOmZhbHNlLCJzaG93U2VhcmNoIjpmYWxzZSwic2hvd1RvdGFsUmVzdWx0cyI6ZmFsc2UsInNvcnREYXRlQXNjIjpmYWxzZSwic29ydERhdGVEZXNjIjpmYWxzZSwic29ydERlZmF1bHQiOiJkYXRlRGVzYyIsInNvcnRFbmFibGVQb3B1cCI6ZmFsc2UsInNvcnRFbmFibGVSYW5kb21TYW1wbGluZyI6ZmFsc2UsInNvcnRFdmVudFNvcnQiOmZhbHNlLCJzb3J0RmVhdHVyZWQiOmZhbHNlLCJzb3J0UmFuZG9tIjpmYWxzZSwic29ydFJlc2Vydm9pclBvb2wiOjEwMDAsInNvcnRSZXNlcnZvaXJTYW1wbGUiOjMsInNvcnRUaXRsZUFzYyI6ZmFsc2UsInNvcnRUaXRsZURlc2MiOmZhbHNlLCJzb3VyY2UiOlsiaGF3a3MiXSwidGFnc1VybCI6Ind3dy5hZG9iZS5jb20vY2hpbWVyYS1hcGkvdGFncyIsInRhcmdldEFjdGl2aXR5IjoiIiwidGFyZ2V0RW5hYmxlZCI6ZmFsc2UsInRoZW1lIjoibGlnaHRlc3QiLCJ0aXRsZUhlYWRpbmdMZXZlbCI6ImgzIiwidG90YWxDYXJkc1RvU2hvdyI6MTAsInVzZUxpZ2h0VGV4dCI6ZmFsc2UsInVzZU92ZXJsYXlMaW5rcyI6ZmFsc2UsInVzZXJJbmZvIjpbXX0="
              >My CaaS Collection</a
            >
          </p>
        </div>
      </main>`;

    window.fetch = stub().returns(
      new Promise((resolve) => {
        resolve({
          ok: true,
          json: () => ({
            data: [
              {
                key: 'collectionTitle',
                val: 'My Awesome Title',
              },
              {
                key: 'onErrorTitle',
                val: 'Error Loading Title',
              },
              {
                key: 'onErrorDesc',
                val: 'Error Desc',
              },
            ],
          }),
        });
      }),
    );
  });

  afterEach(() => {
    window.fetch = ogFetch;
  });

  it('inits the CaaS collection', async () => {
    const a = document.getElementById('caaslink');
    await init(a);
    await waitForElement('#caas');
    await delay(5);
    console.log(loadScript);
    expect(loadScript.callCount).to.equal(3);
    expect(loadStyle.callCount).to.equal(1);
    expect(caasEl).to.equal(document.getElementById('caas'));
  });
});
