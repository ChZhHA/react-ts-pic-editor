import React, { Component } from "react";
import { render } from "react-dom";
import PicEditor from "./picEditor";
import "./style.css";

class App extends Component<any, any> {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <PicEditor />
      </div>
    );
  }
}

render(<App />, document.getElementById("root"));
