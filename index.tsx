import React, { Component } from "react";
import { render } from "react-dom";
import PicEditor from "./picEditor";
import "./style.css";
import img from './img.png'

class App extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <PicEditor src={img}/>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
