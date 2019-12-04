import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { NavMenu } from './NavMenu';
import { layoutUtils } from '../init';

interface LayoutState {
  extraStyle: string;
}

export class Layout extends Component<any, LayoutState, any> {
  static displayName = Layout.name;

  constructor(props:any) {
    super(props);
    
    this.state = {
      extraStyle: ""
    };

    layoutUtils.onChange = (style: string) => {
      this.setState({extraStyle: style});
    }
  }

  render() {
    return (
      <div>
        <NavMenu />
        <Container className={`${this.state.extraStyle} wide`}>
          {this.props.children}
        </Container>
      </div>
    );
  }
}
