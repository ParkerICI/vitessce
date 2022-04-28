import expect from 'expect';
import { CoordinationType } from './v2-constants';
import {
  VitessceConfig,
} from './v2-api';
import {
  hconcat,
  vconcat,
} from '../common';

describe('src/view-configs/api/v2/v2-api.js', () => {
  describe('VitessceConfigV2', () => {
    it('can be instantiated', () => {
      const config = new VitessceConfig('2.0.0', 'My config');

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {},
        datasets: [],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '2.0.0',
      });
    });
    it('should throw an error when attempting to construct view config schemas before v2.0.0', () => {
      const tryFailureConstructor = () => (new VitessceConfig('1.0.2', 'My config', 'My description'));
      expect(tryFailureConstructor).toThrow();
    });
    it('should throw an error when attempting to load view config schemas before v2.0.0', () => {
      const tryFailureMethod = () => VitessceConfig.fromJSON({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '1.0.2',
      });
      expect(tryFailureMethod).toThrow();
    });
    it('can add a dataset', () => {
      const config = new VitessceConfig('2.0.0', 'My config');
      config.addDataset('My dataset');

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '2.0.0',
      });
    });
    it('can add a file to a dataset', () => {
      const config = new VitessceConfig('2.0.0', 'My config', 'My config description');
      config.addDataset('My dataset', 'My dataset description').addFile(
        'http://example.com/cells.json',
        'obs',
        'cells.json',
        { obsType: 'cell' },
      );

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
        },
        datasets: [{
          name: 'My dataset',
          description: 'My dataset description',
          uid: 'A',
          files: [{
            url: 'http://example.com/cells.json',
            dataType: 'obs',
            fileType: 'cells.json',
            entityTypes: {
              obsType: 'cell',
            },
          }],
        }],
        description: 'My config description',
        initStrategy: 'auto',
        layout: [],
        name: 'My config',
        version: '2.0.0',
      });
    });

    it('can add a view', () => {
      const config = new VitessceConfig('2.0.0', 'My config');
      const dataset = config.addDataset('My dataset');
      config.addView(dataset, 'description');
      config.addView(dataset, 'obsScatterplot', { mapping: 'PCA' });

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            uid: 'view-0',
            viewType: 'description',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          {
            uid: 'view-1',
            viewType: 'obsScatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        name: 'My config',
        version: '2.0.0',
      });
    });
    it('can add a coordination scope', () => {
      const config = new VitessceConfig('2.0.0', 'My config');
      const dataset = config.addDataset('My dataset');
      const pca = config.addView(dataset, 'obsScatterplot', { mapping: 'PCA' });
      const tsne = config.addView(dataset, 'obsScatterplot', { mapping: 't-SNE' });

      const [ezScope, etxScope, etyScope] = config.addCoordination(
        CoordinationType.EMBEDDING_ZOOM,
        CoordinationType.EMBEDDING_TARGET_X,
        CoordinationType.EMBEDDING_TARGET_Y,
      );
      pca.useCoordination(ezScope, etxScope, etyScope);
      tsne.useCoordination(ezScope, etxScope, etyScope);

      ezScope.setValue(10);
      etxScope.setValue(11);
      etyScope.setValue(12);


      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
            B: 't-SNE',
          },
          embeddingZoom: {
            A: 10,
          },
          embeddingTargetX: {
            A: 11,
          },
          embeddingTargetY: {
            A: 12,
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            uid: 'view-0',
            viewType: 'obsScatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          {
            uid: 'view-1',
            viewType: 'obsScatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'B',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        name: 'My config',
        version: '2.0.0',
      });
    });

    it('can add a coordination scope using the link views convenience function', () => {
      const config = new VitessceConfig('2.0.0', 'My config');
      const dataset = config.addDataset('My dataset');
      const pca = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const tsne = config.addView(dataset, 'scatterplot', { mapping: 't-SNE' });

      config.linkViews(
        [pca, tsne],
        [
          CoordinationType.EMBEDDING_ZOOM,
        ],
      );

      config.linkViews(
        [pca, tsne],
        [
          CoordinationType.EMBEDDING_TARGET_X,
          CoordinationType.EMBEDDING_TARGET_Y,
        ],
        [
          2,
          3,
        ],
      );

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
            B: 't-SNE',
          },
          embeddingZoom: {
            A: null,
          },
          embeddingTargetX: {
            A: 2,
          },
          embeddingTargetY: {
            A: 3,
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            uid: 'view-0',
            viewType: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
          {
            uid: 'view-1',
            viewType: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'B',
              embeddingTargetX: 'A',
              embeddingTargetY: 'A',
              embeddingZoom: 'A',
            },
            x: 0,
            y: 0,
            w: 1,
            h: 1,
          },
        ],
        name: 'My config',
        version: '2.0.0',
      });
    });

    it('can create a layout', () => {
      const config = new VitessceConfig('2.0.0', 'My config');
      const dataset = config.addDataset('My dataset');
      const v1 = config.addView(dataset, 'spatial');
      const v2 = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const v3 = config.addView(dataset, 'status');

      config.layout(hconcat(v1, vconcat(v2, v3)));

      const configJSON = config.toJSON();
      expect(configJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            uid: 'view-0',
            viewType: 'spatial',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 0,
            y: 0,
            w: 6,
            h: 12,
          },
          {
            uid: 'view-1',
            viewType: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
            },
            x: 6,
            y: 0,
            w: 6,
            h: 6,
          },
          {
            uid: 'view-2',
            viewType: 'status',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 6,
            y: 6,
            w: 6,
            h: 6,
          },
        ],
        name: 'My config',
        version: '2.0.0',
      });
    });

    it('can load a view config from JSON', () => {
      const config = new VitessceConfig('2.0.0', 'My config');
      const dataset = config.addDataset('My dataset');
      const v1 = config.addView(dataset, 'spatial');
      const v2 = config.addView(dataset, 'scatterplot', { mapping: 'PCA' });
      const v3 = config.addView(dataset, 'status');

      config.layout(hconcat(v1, vconcat(v2, v3)));

      const origConfigJSON = config.toJSON();

      const loadedConfig = VitessceConfig.fromJSON(origConfigJSON);
      const loadedConfigJSON = loadedConfig.toJSON();

      expect(loadedConfigJSON).toEqual({
        coordinationSpace: {
          dataset: {
            A: 'A',
          },
          embeddingType: {
            A: 'PCA',
          },
        },
        datasets: [{
          name: 'My dataset',
          uid: 'A',
          files: [],
        }],
        initStrategy: 'auto',
        layout: [
          {
            uid: 'view-0',
            viewType: 'spatial',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 0,
            y: 0,
            w: 6,
            h: 12,
          },
          {
            uid: 'view-1',
            viewType: 'scatterplot',
            coordinationScopes: {
              dataset: 'A',
              embeddingType: 'A',
            },
            x: 6,
            y: 0,
            w: 6,
            h: 6,
          },
          {
            uid: 'view-2',
            viewType: 'status',
            coordinationScopes: {
              dataset: 'A',
            },
            x: 6,
            y: 6,
            w: 6,
            h: 6,
          },
        ],
        name: 'My config',
        version: '2.0.0',
      });
    });
  });
});
