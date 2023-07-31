/* eslint-disable no-prototype-builtins */
/* eslint-disable no-restricted-syntax */

function getDifference(object1, object2) {
  const diff = {};

  Object.keys(object1).forEach((key) => {
    if (object2.hasOwnProperty(key)) {
      if (typeof object1[key] === 'object' && object1[key] !== null && object2[key] !== null) {
        const valueDiff = getDifference(object1[key], object2[key]);
        if (Object.keys(valueDiff).length > 0) {
          diff[key] = valueDiff;
        }
      } else if (object1[key] !== object2[key] && object1[key] !== '' && object2[key] !== '') {
        diff[key] = {
          preview: object1[key],
          live: object2[key],
        };
      }
    } else if (object1[key] !== '') {
      diff[key] = {
        preview: object1[key],
        live: 'key does not exist in live object',
      };
    }
  });

  Object.keys(object2).forEach((key) => {
    if (!object1.hasOwnProperty(key) && object2[key] !== '') {
      diff[key] = {
        preview: 'key does not exist in preview object',
        live: object2[key],
      };
    }
  });

  return diff;
}

export default function init(el) {
// Create HTML elements in a JS file.
  const urlForm = document.createElement('form');
  urlForm.id = 'urlForm';

  const urlInput = document.createElement('input');
  urlInput.id = 'urlInput';
  urlInput.type = 'text';
  urlInput.placeholder = 'https://main--milo--adobecom.hlx.page/metadata.json';

  const getDiffButton = document.createElement('button');
  getDiffButton.id = 'getDiffButton';
  getDiffButton.innerText = 'Get Diff';

  // Create a loader div
  const loaderDiv = document.createElement('div');
  loaderDiv.id = 'loader';
  loaderDiv.innerText = 'Loading...';
  loaderDiv.style.display = 'none';

  urlForm.appendChild(urlInput);
  urlForm.appendChild(getDiffButton);

  const resultArea = document.createElement('pre');
  resultArea.id = 'resultArea';

  el.appendChild(urlForm);
  el.appendChild(loaderDiv);
  el.appendChild(resultArea);

  document.getElementById('getDiffButton').addEventListener('click', (e) => {
    e.preventDefault();

    const url = document.getElementById('urlInput').value;

    // Show the loader
    document.getElementById('loader').style.display = 'block';

    Promise.all([
      fetch(url.replace('.live', '.page')),
      fetch(url.replace('.page', '.live')),
    ])
      .then((responses) => Promise.all(responses.map((response) => response.json()))).then((data) => {
        const diff = getDifference(data[0], data[1]);
        document.getElementById('resultArea').innerText = JSON.stringify(diff, null, 2);
        // Hide the loader
        document.getElementById('loader').style.display = 'none';
      }).catch((error) => {
        console.error('Error:', error);
        // Hide the loader
        document.getElementById('loader').style.display = 'none';
      });
  });
}
