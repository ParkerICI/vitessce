/* eslint-disable no-underscore-dangle */
import { openArray } from 'zarr';
import range from 'lodash/range';
import ZarrDataSource from './ZarrDataSource';
import { parseVlenUtf8 } from './AnnDataSource';

/**
 * A base MuData loader which has all shared methods for more comlpex laoders,
 * like loading cell names and ids. It inherits from ZarrDataSource.
 */
export default class MuDataSource extends ZarrDataSource {
  constructor(...args) {
    super(...args);
    /** @type {Map<string, Promise<string[]>} */
    this.obsPromises = new Map();
  }

  /**
   * Class method for loading obs variables.
   * Takes the location as an argument because this is shared across objects,
   * which have different ways of specifying location.
   * @param {string[]} obsPaths An array of strings like "obs/leiden" or "obs/bulk_labels."
   * @returns {Promise} A promise for an array of ids with one per cell.
   */
  loadObsVariables(obsPaths) {
    const obsPromises = obsPaths.map((obsPath) => {
      const getObsCol = (obsCol) => {
        if (!this.obsPromises.has(obsCol)) {
          const obsPromise = this._loadObsVariable(obsCol).catch((err) => {
            // clear from cache if promise rejects
            this.obsPromises.delete(obsCol);
            // propagate error
            throw err;
          });
          this.obsPromises.set(obsCol, obsPromise);
        }
        return this.obsPromises.get(obsCol);
      };
      if (!obsPath) {
        return Promise.resolve(undefined);
      }
      if (Array.isArray(obsPath)) {
        return Promise.resolve(Promise.all(obsPath.map(getObsCol)));
      }
      return getObsCol(obsPath);
    });
    return Promise.all(obsPromises);
  }

  async _loadObsVariable(obs) {
    const { store } = this;
    const { categories } = await this.getJson(`${obs}/.zattrs`);
    let categoriesValues;
    if (categories) {
      const { dtype } = await this.getJson(`/obs/${categories}/.zarray`);
      if (dtype === '|O') {
        categoriesValues = await this.getFlatArrDecompressed(`/obs/${categories}`);
      }
    }
    const obsArr = await openArray({ store, path: obs, mode: 'r' });
    const obsValues = await obsArr.get();
    const { data } = obsValues;
    const mappedObsValues = Array.from(data).map(
      i => (!categoriesValues ? String(i) : categoriesValues[i]),
    );
    return mappedObsValues;
  }

  /**
   * Class method for loading general numeric arrays.
   * @param {string} path A string like obsm.X_pca.
   * @returns {Promise} A promise for a zarr array containing the data.
   */
  loadNumeric(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(arr => arr.get());
  }

  /**
   * A common method for loading flattened data
   * i.e that which has shape [n] where n is a natural number.
   * @param {string} path A path to a flat array location, like obs/_index
   * @returns {Array} The data from the zarr array.
   */
  getFlatArrDecompressed(path) {
    const { store } = this;
    return openArray({
      store,
      path,
      mode: 'r',
    }).then(async (z) => {
      let data;
      const parseAndMergeTextBytes = (dbytes) => {
        const text = parseVlenUtf8(dbytes);
        if (!data) {
          data = text;
        } else {
          data = data.concat(text);
        }
      };
      const mergeBytes = (dbytes) => {
        if (!data) {
          data = dbytes;
        } else {
          const tmp = new Uint8Array(dbytes.buffer.byteLength + data.buffer.byteLength);
          tmp.set(new Uint8Array(data.buffer), 0);
          tmp.set(dbytes, data.buffer.byteLength);
          data = tmp;
        }
      };
      const numRequests = Math.ceil(z.meta.shape[0] / z.meta.chunks[0]);
      const requests = range(numRequests).map(async item => store.getItem(`${z.keyPrefix}${String(item)}`)
        .then(buf => z.compressor.then(compressor => compressor.decode(buf))));
      const dbytesArr = await Promise.all(requests);
      dbytesArr.forEach((dbytes) => {
        // Use vlenutf-8 decoding if necessary and merge `data` as a normal array.
        if (Array.isArray(z.meta.filters) && z.meta.filters[0].id === 'vlen-utf8') {
          parseAndMergeTextBytes(dbytes);
          // Otherwise just merge the bytes as a typed array.
        } else {
          mergeBytes(dbytes);
        }
      });
      const {
        meta: {
          shape: [length],
        },
      } = z;
      // truncate the filled in values
      return data.slice(0, length);
    });
  }

  /**
   * Class method for loading the obs index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadObsIndex() {
    if (this.obsIndex) {
      return this.obsIndex;
    }
    this.obsIndex = this.getJson('obs/.zattrs')
      .then(({ _index }) => this.getFlatArrDecompressed(`/obs/${_index}`));
    return this.obsIndex;
  }

  /**
   * Class method for loading the var index.
   * @returns {Promise} An promise for a zarr array containing the indices.
   */
  loadVarIndex() {
    if (this.varIndex) {
      return this.varIndex;
    }
    this.varIndex = this.getJson('var/.zattrs')
      .then(({ _index }) => this.getFlatArrDecompressed(`/var/${_index}`));
    return this.varIndex;
  }
}