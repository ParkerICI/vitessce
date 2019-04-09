import React from 'react';
import PubSub from 'pubsub-js';

import Genes from './Genes';

import { SCROLL_CARD } from '../classNames';
import TitleInfo from '../TitleInfo';
import { GENES_ADD, CELLS_COLOR, CLEAR_PLEASE_WAIT } from '../../events';
import { interpolateColors } from '../utils';

export default class GenesSubscriber extends React.Component {
  constructor(props) {
    super(props);
    this.state = { genes: {}, selectedId: null };
    this.setSelectedGene = this.setSelectedGene.bind(this);
  }

  componentWillMount() {
    this.genesAddToken = PubSub.subscribe(GENES_ADD, this.genesAddSubscriber.bind(this));
  }

  componentWillUnmount() {
    PubSub.unsubscribe(this.genesAddToken);
  }

  genesAddSubscriber(msg, genes) {
    this.setState({ genes });
  }

  setSelectedGene(selectedId) {
    this.setState({ selectedId });
    const { genes } = this.state;
    const cellColors = {};

    const { cells, max } = genes[selectedId];
    Object.entries(cells).forEach(
      ([cellId, value]) => {
        cellColors[cellId] = interpolateColors(value / max);
      },
    );
    PubSub.publish(CELLS_COLOR, cellColors);
  }

  render() {
    const { genes, selectedId } = this.state;
    const genesSelected = {};
    const genesKeys = Object.keys(genes);
    genesKeys.forEach((geneId) => {
      genesSelected[geneId] = geneId === selectedId;
    });
    return (
      <React.Fragment>
        <TitleInfo
          title="Expression Levels"
          info={`${genesKeys.length} genes`}
        />
        <div className={SCROLL_CARD}>
          <Genes
            genesSelected={genesSelected}
            setSelectedGene={this.setSelectedGene}
            clearPleaseWait={
              layerName => PubSub.publish(CLEAR_PLEASE_WAIT, layerName)
            }
          />
        </div>
      </React.Fragment>
    );
  }
}