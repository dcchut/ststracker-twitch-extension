import React, { Component } from 'react';

export class STSRelic extends Component {
  constructor(props) {
    super(props);

    this.onHover = this.onHover.bind(this);
    this.onLeave = this.onLeave.bind(this);
    this.state = {
      hover : false,
    };
  }

  onHover() {
    this.setState({hover : true});
  }

  onLeave() {
    this.setState({hover : false});
  }

  render() {
    var backClass = 'd-flex justify-content-between align-items-center p-1';
   
    if (this.state.hover) {
      backClass += ' accent-light';
    }

    return (
      <ul className="sts-relic rounded p-0 pl-1 m-0" onMouseEnter={this.onHover} onMouseLeave={this.onLeave}>
        <li className={backClass} key={this.props.asset.id}>
          <div>
            <h5 className="font-medium">{this.props.asset.name}</h5>
            <small className="font-smaller">{this.props.asset.description}</small>
          </div>
          <img className="relic" src={require('../../util/STSStore/relics/' + this.props.asset.id + '.png')} />
        </li>
      </ul>
    )
  }
}
