import React, { Component } from "react";
import { render } from "react-dom";
import PicEditor from "./picEditor";
import "./style.css";
import { src } from "./img";
class App extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <PicEditor src={src}/>
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
