import React, { Component } from 'react';

export class STSCard extends Component {
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
        let backClass = 'd-flex flex-column p-1';

        if (this.state.hover) {
            backClass += ' accent-light';
        }

        return (
            <ul className="sts-card rounded p-0 pl-1 m-0" onMouseEnter={this.onHover} onMouseLeave={this.onLeave}>
                <li className={backClass} key={this.props.asset.id}>
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="font-medium flex-grow-1">{this.props.asset.name}</h5>
                        <small className="font-small">x{this.props.cardCount}</small>
                    </div>
                    <small className="font-smaller">{this.props.asset.description}</small>
                </li>
            </ul>
        )
    }
}
